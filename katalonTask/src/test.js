"use strict";

const execute = require('./execute');

const version = '6.2.0';
console.log("version: ", version);

const location = '';
console.log("location: ", location);

const executeArgs = '-retry=0 -testSuitePath="Test Suites/TS_RegressionTest" -executionProfile="default" -browserType="Firefox"';
console.log('execute: ', executeArgs);

const x11Display = '';
console.log('x11 display:', x11Display);

const xvfbConfiguration = '';
console.log('xvfbConfiguration: ', xvfbConfiguration);

const dirPath = "C:\\Users\\haimnguyen\\data\\ci-samples";

execute({
    version,
    location,
    executeArgs,
    x11Display,
    xvfbConfiguration,
    dirPath
});