"use strict";

var _ = require('lodash');

var fs = require('fs');

var path = require('path');

var file = require('./file');

var http = require('./http');

var defaultLogger = require('./logger');

var os = require('./os');

var releasesList = 'https://raw.githubusercontent.com/katalon-studio/katalon-studio/master/releases.json';

function find(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    return;
  }

  var files = fs.readdirSync(startPath);

  for (var i = 0; i < files.length; i += 1) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      var _file = find(filename, filter, callback);

      if (!_.isEmpty(_file)) {
        return _file;
      }
    } else if (filter.test(filename)) {
      return filename;
    }
  }
}

function getKsLocation(ksVersionNumber, ksLocation) {
  if (!ksVersionNumber && !ksLocation) {
    defaultLogger.error("Please specify 'ksVersionNumber' or 'ksLocation'");
  }

  if (ksLocation) {
    return Promise.resolve({
      ksLocationParentDir: ksLocation
    });
  }

  return http.request(releasesList, '', {}, 'GET').then(function (_ref) {
    var body = _ref.body;
    var osVersion = os.getVersion();
    var ksVersion = body.find(function (item) {
      return item.version === ksVersionNumber && item.os === osVersion;
    });
    var fileName = ksVersion.filename;
    var fileExtension;

    if (fileName.endsWith('.zip')) {
      fileExtension = '.zip';
    } else if (fileName.endsWith('.tar.gz')) {
      fileExtension = '.tar.gz';
    } else {
      throw "Unexpected file name ".concat(fileName);
    }

    var userhome = os.getUserHome();
    var ksLocationParentDir = path.join(userhome, '.katalon', ksVersionNumber);
    var katalonDoneFilePath = path.join(ksLocationParentDir, '.katalon.done');
    var ksLocationDirName = fileName.replace(fileExtension, '');
    var ksLocation = path.join(ksLocationParentDir, ksLocationDirName);

    if (fs.existsSync(katalonDoneFilePath)) {
      return Promise.resolve({
        ksLocationParentDir: ksLocationParentDir
      });
    }

    defaultLogger.info("Download Katalon Studio ".concat(ksVersionNumber, " to ").concat(ksLocationParentDir, "."));
    return file.downloadAndExtract(ksVersion.url, ksLocationParentDir).then(function () {
      fs.writeFileSync(katalonDoneFilePath, '');
      return Promise.resolve({
        ksLocationParentDir: ksLocationParentDir
      });
    });
  });
}

module.exports = {
  execute: function execute(ksVersionNumber, ksLocation, ksProjectPath, ksArgs, x11Display, xvfbConfiguration) {
    var logger = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : defaultLogger;
    return getKsLocation(ksVersionNumber, ksLocation).then(function (_ref2) {
      var ksLocationParentDir = _ref2.ksLocationParentDir;
      logger.info("Katalon Folder: ".concat(ksLocationParentDir));
      var ksExecutable = find(ksLocationParentDir, /katalon$|katalon\.exe$/);
      logger.info("Katalon Executable File: ".concat(ksExecutable)); // fs.chmodSync(ksExecutable, '755');

      if (ksExecutable.indexOf(' ') >= 0) {
        ksExecutable = "\"".concat(ksExecutable, "\"");
      }

      var ksCommand = "".concat(ksExecutable, " -noSplash -runMode=console");

      if (ksArgs.indexOf('-projectPath') < 0) {
        ksCommand = "".concat(ksCommand, " -projectPath=\"").concat(ksProjectPath, "\"");
      }

      ksCommand = "".concat(ksCommand, " ").concat(ksArgs);
      logger.info("Execute Katalon Studio: ".concat(ksCommand));

      if (logger !== defaultLogger) {
        defaultLogger.debug("Execute Katalon Studio command: ".concat(ksCommand));
      }

      return os.runCommand(ksCommand, x11Display, xvfbConfiguration, logger);
    });
  },
  getKsLocation: getKsLocation
};