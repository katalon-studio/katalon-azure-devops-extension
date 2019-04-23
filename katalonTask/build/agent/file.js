"use strict";

var decompress = require('decompress');

var tmp = require('tmp');

var http = require('./http');

var defaultLogger = require('./logger');

module.exports = {
  downloadAndExtract: function downloadAndExtract(url, targetDir) {
    var logger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultLogger;
    logger.info("Downloading from ".concat(url, ". It may take a few minutes."));
    var file = tmp.fileSync();
    var filePath = file.name;
    return http.stream(url, filePath).then(function () {
      logger.info("Decompressing the file into ".concat(targetDir, "."));
      return decompress(filePath, targetDir, {
        filter: function filter(decompressFile) {
          var decompressPath = decompressFile.path;
          return !decompressPath.includes('.git') && !decompressPath.includes('__MACOSX');
        }
      });
    });
  }
};