'use strict';

const LinvoDB = require('linvodb3');
const Joi = require('joi');
const Hoek = require('hoek');

const schema = {
  modelName: Joi.string().default('doc'),
  filename: Joi.string().default('./linvo.db'),
  schema: Joi.object().default({})
};

exports.register = function (plugin, options, next) {

  let db = {};

  Joi.validate(options, schema, (err, res) => {

    Hoek.assert(!err, err);

    const conf = {
      filename: options.filename
    };

    LinvoDB.dbPath = process.cwd();
    db = new LinvoDB(options.modelName, options.schema, conf);

  });

  plugin.expose('db', db);

  next();

};



exports.register.attributes = {
  pkg: require('../package.json')
};
