"use strict";

var archiver = require('archiver');

var find = require('find');

var fse = require('fs-extra');

var path = require('path');

var uuidv4 = require('uuid/v4');

var config = require('./config');

var katalonRequest = require('./katalon-request');

var logExtension = /.*[^\.har|.zip]$/;
var harExtension = /.*\.(har)$/; // const uploadInfoOutPath=ka_upload_info.json
// const oauth2 = {
//   grant_type: "password",
//   client_secret: "kit_uploader",
//   client_id: "kit_uploader"
// }

var zip = function zip(folderPath, harFiles) {
  var tempPath = path.join(folderPath, 'katalon-analytics-tmp');
  fse.ensureDirSync(tempPath); // create a file to stream archive data to.

  var zipPath = path.join(tempPath, "hars-".concat(new Date().getTime(), ".zip"));
  var output = fse.createWriteStream(zipPath);
  var archive = archiver('zip', {
    zlib: {
      level: 9
    } // Sets the compression level.

  });
  archive.pipe(output);
  harFiles.forEach(function (file) {
    var fileName = path.basename(file); // const rel = path.relative(folderPath, file);

    archive.file(file, {
      name: fileName
    });
  });
  archive.finalize();
  return zipPath;
};

var writeUploadInfo = function writeUploadInfo(batch, files) {
  var uploadInfo = {};
  uploadInfo[batch] = files;

  if (uploadInfoOutPath) {
    fse.outputJSONSync(file, uploadInfo);
  }
};

module.exports = {
  upload: function upload(folderPath) {
    var email = config.email,
        password = config.password,
        projectId = config.projectId;
    var harFiles = find.fileSync(harExtension, folderPath);
    var logFiles = find.fileSync(logExtension, folderPath);
    var harZips = {};
    harFiles.forEach(function (filePath) {
      var parent = path.resolve(filePath, '../../..');
      var files = harZips[parent];

      if (!files) {
        harZips[parent] = [];
      }

      harZips[parent].push(filePath);
    });
    Object.keys(harZips).map(function (folderPath) {
      var files = harZips[folderPath];
      var zipPath = zip(folderPath, files);
      logFiles.push(zipPath);
    });
    var batch = "".concat(new Date().getTime(), "-").concat(uuidv4());
    var uploadPromises = [];
    katalonRequest.requestToken(email, password).then(function (response) {
      var token = response.body.access_token;

      var _loop = function _loop(i) {
        var filePath = logFiles[i];
        var promise = katalonRequest.getUploadInfo(token, projectId).then(function (_ref2) {
          var body = _ref2.body;
          var uploadUrl = body.uploadUrl;
          var uploadPath = body.path;
          var fileName = path.basename(filePath);
          var folderPath = path.dirname(filePath);
          var parent;

          if (path.extname(fileName) === '.zip') {
            parent = path.resolve(filePath, '../../../..');
          } else {
            parent = path.resolve(filePath, '../../..');
          }

          var rel = path.relative(parent, folderPath);
          return katalonRequest.uploadFile(uploadUrl, filePath).then(function () {
            return katalonRequest.uploadFileInfo(token, projectId, batch, rel, fileName, uploadPath, false);
          });
        });
        uploadPromises.push(promise);
      };

      for (var i = 0; i < logFiles.length - 1; i += 1) {
        _loop(i);
      }

      Promise.all(uploadPromises).then(function () {
        var filePath = logFiles[logFiles.length - 1];
        katalonRequest.requestToken(email, password).then(function (response) {
          var token = response.body.access_token;
          return katalonRequest.getUploadInfo(token, projectId).then(function (_ref) {
            var body = _ref.body;
            var uploadUrl = body.uploadUrl;
            var uploadPath = body.path;
            var fileName = path.basename(filePath);
            var folderPath = path.dirname(filePath);
            var parent;

            if (path.extname(fileName) === '.zip') {
              parent = path.resolve(filePath, '../../../..');
            } else {
              parent = path.resolve(filePath, '../../..');
            }

            var rel = path.relative(parent, folderPath);
            return katalonRequest.uploadFile(uploadUrl, filePath).then(function () {
              return katalonRequest.uploadFileInfo(token, projectId, batch, rel, fileName, uploadPath, true);
            });
          });
        });
      });
      writeUploadInfo(batch, logFiles);
    });
  }
};