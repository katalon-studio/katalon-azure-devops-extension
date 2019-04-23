"use strict";

var _ = require('lodash');

var fs = require('fs');

var fse = require('fs-extra');

var ini = require('ini');

var path = require('path');

var logger = require('./logger');

var configFile = path.resolve(process.cwd(), 'config.ini');
var global = {};

function isConfigFileEmpty() {
  var empty = true;

  if (fs.existsSync(configFile)) {
    var configs = ini.parse(fs.readFileSync(configFile, 'utf-8'));
    empty = _.isEmpty(configs);
  }

  if (empty) {
    logger.debug('config file is empty');
  }

  return empty;
} // NOTE: ONLY EXPORT FUNCTIONS, DO NOT EXPORT FIELDS


module.exports = {
  update: function update(commandLineConfigs) {
    var filepath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : configFile;

    /* Update the module with configs read from both config file and command line */
    // Filter undefined fields
    commandLineConfigs = _.pickBy(commandLineConfigs, function (value) {
      return value !== undefined;
    }); // Read configs from file

    var fileConfigs = this.read(filepath); // Merge both configs

    var configs = _.extend({}, fileConfigs, commandLineConfigs, {
      pathPatterns: _.get(fileConfigs, 'paths.path', [])
    }); // Add configs to global and export configs


    global = _.extend(global, configs);

    for (var p in global) {
      module.exports[p] = global[p];
    }
  },
  read: function read(filepath) {
    fse.ensureFileSync(filepath);
    var fp = fse.readFileSync(filepath, 'utf-8');
    return ini.parse(fp);
  },
  write: function write(filepath, configs) {
    // Filter undefined and function fields
    configs = _.pickBy(configs, function (value) {
      return !_.isUndefined(value) && !_.isFunction(value);
    });
    var outputINI = ini.stringify(configs);
    fse.outputFileSync(filepath, outputINI);
  },
  getConfigFile: function getConfigFile() {
    return configFile;
  }
};