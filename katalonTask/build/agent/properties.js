"use strict";

var fse = require('fs-extra');

var properties = require('properties');

var logger = require('./logger');

function writeProperties(propertiesFile, prop) {
  fse.ensureFileSync(propertiesFile);
  properties.stringify(prop, {
    path: propertiesFile
  }, function (err, str) {
    if (err) {
      return logger.error(err);
    }

    return logger.trace('Write properties:\n', str);
  });
}

module.exports.writeProperties = writeProperties;