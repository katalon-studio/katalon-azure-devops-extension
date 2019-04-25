"use strict";

var decompress = require('decompress');

var tmp = require('tmp');

var http = require('./http');

var defaultLogger = require('./logger');

module.exports = {
  extract: function extract(filePath, targetDir, haveFilter) {
    var logger = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultLogger;
    logger.info("Decompressing the ".concat(filePath, " into ").concat(targetDir, "."));
    return decompress(filePath, targetDir, {
      filter: function filter(decompressFile) {
        if (haveFilter) {
          var decompressPath = decompressFile.path;
          return !decompressPath.includes('/.git/') && !decompressPath.includes('__MACOSX');
        } else {
          return true;
        }
      }
    });
  },
  downloadAndExtract: function downloadAndExtract(url, targetDir, haveFilter) {
    var _this = this;

    var logger = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultLogger;
    logger.info("Downloading from ".concat(url, ". It may take a few minutes."));
    var file = tmp.fileSync();
    var filePath = file.name;
    return http.stream(url, filePath).then(function () {
      return _this.extract(filePath, targetDir, haveFilter, logger);
    });
  }
};