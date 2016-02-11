'use strict';

const Hapi = require('hapi');
const Lab = require('lab');
const Code = require('code');
const FS = require('fs');
const Trash = require('trash');

const internals = {};

const lab = exports.lab = Lab.script();
const expect = Code.expect;

lab.experiment('Plugin Tests', () => {

  let server = {};

  lab.beforeEach((done) => {

    server = new Hapi.Server();
    done();
  });

  lab.afterEach((done) => {

    Trash(['./testlinvo.db']).then(done());
  });

  lab.test('Rejection of invalid options', (done) => {

    const register = () => {

      server.register({
        register: require('../'),
        options: {
          directory: 'blah'
        }
      }, (err) => {

        throw err;
      });
    };

    expect(register).to.throw(Error);
    done();
  });

  lab.test('Successful registration of plugin', (done) => {

    server.register({
      register: require('../'),
      options: {
        modelName: 'test',
        filename: 'testlinvo.db',
        schema: {}
      }
    }, (err) => {

      expect(err).to.not.exist();
      expect(FS.accessSync('./testlinvo.db', FS.F_OK)).to.not.exist();
      done();
    });
  });

  lab.test('Successfully access plugin exposed objects and methods', (done) => {

    server.connection();
    server.register({
      register: require('../'),
      options: {
        modelName: 'test',
        filename: 'testlinvo.db',
        schema: {}
      }
    }, (err) => {

      expect(err).to.not.exist();

      server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {

          const plugin = request.server.plugins['hapi-linvodb'];

          expect(plugin.db.modelName).to.equal('test');
          expect(plugin.db.filename).to.equal('testlinvo.db');

          plugin.db.insert({ a: 1 }, (err, doc) => {

            expect(err).to.not.exist();
            expect(doc.a).to.equal(1);

            plugin.db.find({}, (err, docs) => {

              expect(err).to.not.exist();
              expect(docs).to.be.an.array();
              done();
            });
          });
        }
      });

      server.inject({
        method: 'GET',
        url: '/'
      }, (res) => {

      });

    });
  });

  lab.test('Successful schema creation', (done) => {

    server.connection();
    server.register({
      register: require('../'),
      options: {
        modelName: 'test',
        filename: 'testlinvo.db',
        schema: {
          name: {
            type: String,
            default: 'nameless'
          },
          age: Number
        }
      }
    }, (err) => {

      expect(err).to.not.exist();

      server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {

          // Get plugin and create a new object
          const plugin = request.server.plugins['hapi-linvodb'];
          const user = new plugin.db({ age: 18 });

          // Confirm passed variable and default get set
          expect(user.age).to.equal(18);
          expect(user.name).to.equal('nameless');

          user.name = 'Adam';
          user.save((err) => {

            expect(err).to.not.exist();

            plugin.db.findOne({ name: 'Adam' }, (err, changed_user) => {

              // Confirm we can retrieve and change saved object
              expect(err).to.not.exist();
              expect(changed_user.name).to.equal('Adam');

              changed_user.age = 'Age';
              changed_user.save((err) => {

                expect(err).to.not.exist();

                plugin.db.findOne({ name: 'Adam' }, (err, unchanged_user) => {

                  // Confirm schema is working. It doesn't generate errors, it just won't make changes if they
                  // don't match the schema
                  expect(err).to.not.exist();
                  expect(unchanged_user.age).to.equal(18);
                  done();
                });
              });
            });
          });
        }
      });

      server.inject({
        method: 'GET',
        url: '/'
      }, (res) => {

      });
    });

  });

});
