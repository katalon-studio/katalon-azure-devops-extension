"use strict";

global.appRoot = '.';

const tl = require("azure-pipelines-task-lib/task");
const path = require('path');
const glob = require('glob');
const ks = require('./build/agent/katalon-studio');

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
  
        const projectFilePattern = "**/*.prj";
        const dirPath = "D:\\CI-sample";
        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        [ksProjectPath] = glob.sync(projectPathPattern, { nodir: true });

        console.log(ksProjectPath);

        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
            .then(()=> {
                console.log("Run Katalon success!");
            })
            .catch((error) => {
                tl.setResult(tl.TaskResult.Failed, error.message);
                console.log(error);
            })
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();