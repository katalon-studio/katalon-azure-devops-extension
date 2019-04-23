"use strict";

var http = require('./http');

var config = require('./config');

var TOKEN_URI = '/oauth/token';
var UPLOAD_URL_URI = '/api/v1/files/upload-url';
var KATALON_TEST_REPORTS_URI = '/api/v1/katalon-test-reports';
var KATALON_RECORDER_TEST_REPORTS_URI = '/api/v1/katalon-recorder/test-reports';
var KATALON_JUNIT_TEST_REPORTS_URI = '/api/v1/junit/test-reports';
var KATALON_AGENT_URI = '/api/v1/agent/';
var KATALON_JOB_URI = '/api/v1/jobs/';
var oauth2 = {
  grant_type: 'password',
  client_secret: 'kit_uploader',
  client_id: 'kit_uploader'
};
module.exports = {
  requestToken: function requestToken(email, password) {
    var data = {
      username: email,
      password: password,
      grant_type: oauth2.grant_type
    };
    var options = {
      auth: {
        username: oauth2.client_id,
        password: oauth2.client_secret
      },
      form: data,
      json: true
    };
    return http.request(config.serverUrl, TOKEN_URI, options, 'post');
  },
  getUploadInfo: function getUploadInfo(token, projectId) {
    var options = {
      auth: {
        bearer: token
      },
      json: true,
      qs: {
        projectId: projectId
      }
    };
    return http.request(config.serverUrl, UPLOAD_URL_URI, options, 'get');
  },
  uploadFile: function uploadFile(uploadUrl, filePath) {
    return http.uploadToS3(uploadUrl, filePath);
  },
  uploadFileInfo: function uploadFileInfo(token, projectId, batch, folderName, fileName, uploadedPath, isEnd, reportType) {
    var url = KATALON_TEST_REPORTS_URI;

    if (reportType === 'junit') {
      url = KATALON_JUNIT_TEST_REPORTS_URI;
    } else if (reportType === 'recorder') {
      url = KATALON_RECORDER_TEST_REPORTS_URI;
    }

    var options = {
      auth: {
        bearer: token
      },
      json: true,
      qs: {
        projectId: projectId,
        batch: batch,
        folderPath: folderName,
        fileName: fileName,
        uploadedPath: uploadedPath,
        isEnd: isEnd
      }
    };
    return http.request(config.serverUrl, url, options, 'post');
  },
  pingAgent: function pingAgent(token, options) {
    options.auth = {
      bearer: token
    };
    return http.request(config.serverUrl, KATALON_AGENT_URI, options, 'POST');
  },
  requestJob: function requestJob(token, uuid, teamId) {
    var options = {
      auth: {
        bearer: token
      },
      qs: {
        uuid: uuid,
        teamId: teamId
      }
    };
    return http.request(config.serverUrl, "".concat(KATALON_JOB_URI, "get-job"), options, 'GET');
  },
  updateJob: function updateJob(token, options) {
    options.auth = {
      bearer: token
    };
    return http.request(config.serverUrl, "".concat(KATALON_JOB_URI, "update-job"), options, 'POST');
  },
  saveJobLog: function saveJobLog(token, jobInfo, batch, fileName) {
    var options = {
      auth: {
        bearer: token
      },
      qs: {
        projectId: jobInfo.projectId,
        jobId: jobInfo.jobId,
        batch: batch,
        folderPath: '',
        fileName: fileName,
        uploadedPath: jobInfo.uploadPath
      }
    };
    return http.request(config.serverUrl, "".concat(KATALON_JOB_URI, "save-log"), options, 'POST');
  },
  getJobLog: function getJobLog(token, jobInfo) {
    var jobId = jobInfo.jobId;
    var options = {
      auth: {
        bearer: token
      }
    };
    return http.request(config.serverUrl, "".concat(KATALON_JOB_URI + jobId, "/get-log"), options, 'GET');
  }
};