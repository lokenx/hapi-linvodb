# hapi-linvodb [![Build Status](https://travis-ci.org/lokenx/hapi-linvodb.svg?branch=master)](https://travis-ci.org/lokenx/hapi-linvodb) [![codecov.io](https://codecov.io/github/lokenx/hapi-linvodb/coverage.svg?branch=master)](https://codecov.io/github/lokenx/hapi-linvodb?branch=master)

Simple [Hapi](http://hapijs.com/) plugin for [linvodb3](https://github.com/Ivshti/linvodb3)

# Installation

```
npm install hapi-linvodb
```

# Usage

```js
'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: 8000
});

server.register({
    register: require('hapi-linvodb'),
    options: {
      modelName: 'test',
      filename: 'testlinvo.db',
      schema: {}
    }
}, (err) => {

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {

            // Access plugin
            var db = server.plugins['hapi-linvodb'].db;

            // Use requests database and create requests database if it does not exist
            db.insert({ a: 1 }, (err, doc) => {

                reply({ message: 'request added to database' });
            });

            // If using a schema you have to create a new object otherwise it's ignored
            const user = new db({});
            user.name = 'Adam';

            user.save(() => {

              reply({ message: 'request added to database' });
          });

        }
    });
});

// Start the server
server.start(() => {

    console.info(`Hapi times at ${server.info.uri}`);
});
```

# License

MIT 2016
