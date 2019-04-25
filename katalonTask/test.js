"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

global.appRoot = '.';

// var tl = require("azure-pipelines-task-lib/task");

var path = require('path');

var glob = require('glob');

var ks = require('./build/agent/katalon-studio');

var version, location, executeArgs, x11Display, xvfbConfiguration, ksProjectPath;

function run() {
  try {
    version = '6.1.1';
    console.log("version: ", version);
    location = '';
    console.log("location: ", location);
    executeArgs = '-retry=0 -testSuitePath="Test Suites/TS_RegressionTest" -executionProfile="default" -browserType="Firefox"';
    console.log('execute: ', executeArgs);
    x11Display = '';
    console.log('x11 display:', x11Display);
    xvfbConfiguration = '';
    console.log('xvfbConfiguration: ', xvfbConfiguration);
    var projectFilePattern = "**/*.prj";
    var dirPath = tl.cwd();
    var projectPathPattern = path.resolve(dirPath, projectFilePattern);

    var _glob$sync = glob.sync(projectPathPattern, {
      nodir: true
    });

    var _glob$sync2 = _slicedToArray(_glob$sync, 1);

    ksProjectPath = _glob$sync2[0];
    console.log(ksProjectPath);
    ks.execute(version, location, ksProjectPath, executeArgs, x11Display, xvfbConfiguration).then(function () {
    //   tl.setResult(tl.TaskResult.Succeeded, "run katalon succes");
    })["catch"](function (error) {
    //   tl.setResult(tl.TaskResult.Failed, error.message);
      console.log(error);
    });
  } catch (err) {
    // tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();