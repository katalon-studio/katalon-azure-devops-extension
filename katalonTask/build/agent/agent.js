"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fs = require('fs-extra');

var glob = require('glob');

var ip = require('ip');

var moment = require('moment');

var path = require('path');

var tmp = require('tmp');

var uuidv4 = require('uuid/v4');

var agentState = require('./agent-state');

var config = require('./config');

var file = require('./file');

var jobLogger = require('./job-logger');

var katalonRequest = require('./katalon-request');

var ks = require('./katalon-studio');

var logger = require('./logger');

var os = require('./os');

var properties = require('./properties');

var utils = require('./utils');

var configFile = utils.getPath('agentconfig');
var requestInterval = 60 * 1000;
var projectFilePattern = '**/*.prj';
var testOpsPropertiesFile = 'com.kms.katalon.integration.analytics.properties';
var JOB_STATUS = Object.freeze({
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
});

function updateJob(token, jobOptions) {
  return katalonRequest.updateJob(token, jobOptions)["catch"](function (err) {
    return logger.error("".concat(updateJob.name, ":"), err);
  });
}

function buildJobResponse(jobInfo, jobStatus) {
  var jobOptions = {
    body: {
      id: jobInfo.jobId,
      status: jobStatus
    }
  };
  var time = new Date();

  if (jobStatus === JOB_STATUS.RUNNING) {
    jobOptions.body.startTime = time;
  } else if (jobStatus === JOB_STATUS.SUCCESS || jobStatus === JOB_STATUS.FAILED) {
    jobOptions.body.stopTime = time;
  }

  return jobOptions;
}

function buildTestOpsIntegrationProperties(token, teamId, projectId) {
  return {
    'analytics.authentication.token': token,
    'analytics.integration.enable': true,
    'analytics.server.endpoint': config.serverUrl,
    'analytics.authentication.email': config.email,
    'analytics.authentication.password': config.apikey,
    'analytics.authentication.encryptionEnabled': false,
    'analytics.team': JSON.stringify({
      id: teamId.toString()
    }),
    'analytics.project': JSON.stringify({
      id: projectId.toString()
    }),
    'analytics.testresult.autosubmit': true,
    'analytics.testresult.attach.screenshot': true,
    'analytics.testresult.attach.log': true,
    'analytics.testresult.attach.capturedvideos': false
  };
}

function uploadLog(token, jobInfo, filePath) {
  logger.info('Uploading job execution log...'); // Request upload URL

  return katalonRequest.getUploadInfo(token, jobInfo.projectId).then(function (response) {
    if (!response || !response.body) {
      return;
    }

    var body = response.body;
    var uploadUrl = body.uploadUrl;
    var uploadPath = body.path; // eslint-disable-next-line no-param-reassign

    jobInfo.uploadUrl = uploadUrl; // eslint-disable-next-line no-param-reassign

    jobInfo.uploadPath = uploadPath; // Upload file with received URL
    // eslint-disable-next-line consistent-return

    return katalonRequest.uploadFile(uploadUrl, filePath);
  }).then(function () {
    var batch = "".concat(new Date().getTime(), "-").concat(uuidv4());
    var fileName = path.basename(filePath); // Update job's upload file

    return katalonRequest.saveJobLog(token, jobInfo, batch, fileName);
  });
}

function executeJob(token, jobInfo, keepFiles) {
  // Create directory where temporary files are contained
  var tmpRoot = path.resolve(global.appRoot, 'tmp/');
  fs.ensureDir(tmpRoot); // Create temporary directory to keep extracted project

  var tmpPrefix = moment(new Date()).format('YYYY.MM.DD-H.m-');
  var tmpDir = tmp.dirSync({
    unsafeCleanup: true,
    keep: true,
    dir: tmpRoot,
    prefix: tmpPrefix
  });
  var tmpDirPath = tmpDir.name;
  logger.info('Download test project to temp directory:', tmpDirPath); // Create job logger

  var logFilePath = path.resolve(tmpDirPath, 'debug.log');
  var jLogger = jobLogger.getLogger(logFilePath);
  return file.downloadAndExtract(jobInfo.downloadUrl, tmpDirPath, true, jLogger).then(function () {
    logger.info('Executing job...'); // Find project file inside project directory

    var projectPathPattern = path.resolve(tmpDirPath, projectFilePattern); // eslint-disable-next-line no-param-reassign

    var _glob$sync = glob.sync(projectPathPattern, {
      nodir: true
    });

    var _glob$sync2 = _slicedToArray(_glob$sync, 1);

    jobInfo.ksProjectPath = _glob$sync2[0];
    // Manually configure integration settings for KS to upload execution report
    var ksProjectDir = path.dirname(jobInfo.ksProjectPath);
    var testOpsPropertiesPath = path.resolve(ksProjectDir, 'settings', 'internal', testOpsPropertiesFile);
    properties.writeProperties(testOpsPropertiesPath, buildTestOpsIntegrationProperties(token, jobInfo.teamId, jobInfo.projectId));
    return ks.execute(jobInfo.ksVersionNumber, jobInfo.ksLocation, jobInfo.ksProjectPath, jobInfo.ksArgs, jobInfo.x11Display, jobInfo.xvfbConfiguration, jLogger);
  }).then(function (status) {
    logger.debug('TASK FINISHED WITH STATUS:', status); // Update job status after execution

    var jobStatus = status === 0 ? JOB_STATUS.SUCCESS : JOB_STATUS.FAILED;
    var jobOptions = buildJobResponse(jobInfo, jobStatus);
    logger.debug("Update job with status '".concat(jobStatus, "'"));
    return updateJob(token, jobOptions);
  }).then(function () {
    return uploadLog(token, jobInfo, logFilePath);
  })["catch"](function (err) {
    logger.error("".concat(executeJob.name, ":"), err); // Update job status to failed when exception occured
    // NOTE: Job status is set FAILED might not be because of a failed execution
    // but because of other reasons such as cannot remove tmp directory or cannot upload log

    var jobStatus = JOB_STATUS.FAILED;
    var jobOptions = buildJobResponse(jobInfo, jobStatus);
    logger.debug("Error caught during job execution! Update job with status '".concat(jobStatus, "'"));
    return updateJob(token, jobOptions);
  })["finally"](function () {
    agentState.executingJob = false;
    jLogger.close(); // Remove temporary directory when `keepFiles` is false

    if (!keepFiles) {
      tmpDir.removeCallback();
    }
  });
}

function validateField(configs, propertyName) {
  if (!configs[propertyName]) {
    logger.error("Please specify '".concat(propertyName, "' property in ").concat(path.basename(configFile), "."));
    return false;
  }

  return true;
}

function setLogLevel(logLevel) {
  if (logLevel) {
    logger.level = logLevel;
  }
}

var agent = {
  start: function start() {
    var commandLineConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    logger.info("Agent started @ ".concat(new Date()));
    var hostAddress = ip.address();
    var hostName = os.getHostName();
    var osVersion = os.getVersion();
    config.update(commandLineConfigs, configFile);
    var email = config.email,
        teamId = config.teamId;
    var password = config.apikey;
    setLogLevel(config.logLevel);
    validateField(config, 'email');
    validateField(config, 'apikey');
    validateField(config, 'serverUrl');
    validateField(config, 'teamId');

    if (!config.ksVersionNumber && !config.ksLocation) {
      logger.error("Please specify 'ksVersionNumber' or 'ksLocation' property in ".concat(path.basename(configFile), "."));
    }

    var token;
    setInterval(function () {
      katalonRequest.requestToken(email, password).then(function (requestTokenResponse) {
        token = requestTokenResponse.body.access_token;
        logger.trace("Token: ".concat(token));
        var configs = config.read(configFile);

        if (!configs.uuid) {
          configs.uuid = uuidv4();
          config.write(configFile, configs);
        }

        if (!configs.agentName) {
          configs.agentName = hostName;
        }

        var uuid = configs.uuid,
            agentName = configs.agentName,
            ksLocation = configs.ksLocation,
            keepFiles = configs.keepFiles,
            logLevel = configs.logLevel,
            x11Display = configs.x11Display,
            xvfbRun = configs.xvfbRun;
        var ksVersion = configs.ksVersionNumber;
        setLogLevel(logLevel);
        var requestBody = {
          uuid: uuid,
          name: agentName,
          teamId: teamId,
          hostname: hostName,
          ip: hostAddress,
          os: osVersion
        };
        var options = {
          body: requestBody
        };
        logger.trace(requestBody);
        katalonRequest.pingAgent(token, options)["catch"](function (err) {
          return logger.error(err);
        });

        if (agentState.executingJob) {
          // Agent is executing a job, do nothing
          return;
        } // Agent is not executing job, request new job
        // eslint-disable-next-line consistent-return


        return katalonRequest.requestJob(token, uuid, teamId).then(function (response) {
          if (!response || !response.body || !response.body.parameter || !response.body.testProject) {
            // There is no job to execute
            return;
          }

          var body = response.body;
          var parameter = body.parameter,
              testProject = body.testProject;
          var jobInfo = {
            ksVersionNumber: ksVersion,
            ksLocation: ksLocation,
            ksArgs: parameter.command,
            x11Display: x11Display,
            xvfbConfiguration: xvfbRun,
            downloadUrl: parameter.downloadUrl,
            jobId: body.id,
            projectId: testProject.projectId,
            teamId: teamId
          }; // eslint-disable-next-line consistent-return

          return jobInfo;
        }).then(function (jobInfo) {
          if (!jobInfo) {
            // There is no job to execute
            return;
          } // Update job status to running


          var jobOptions = buildJobResponse(jobInfo, JOB_STATUS.RUNNING);
          updateJob(token, jobOptions);
          agentState.executingJob = true; // eslint-disable-next-line consistent-return

          return executeJob(token, jobInfo, keepFiles);
        })["catch"](function (err) {
          agentState.executingJob = false;
          return logger.error(err);
        });
      })["catch"](function (err) {
        return logger.error(err);
      });
    }, requestInterval);
  },
  stop: function stop() {
    logger.info("Agent stopped @ ".concat(new Date()));
  },
  updateConfigs: function updateConfigs(options) {
    config.update(options, configFile);

    if (!config.uuid) {
      config.uuid = uuidv4();
    }

    config.write(configFile, config);
  }
};
module.exports = agent;