"use strict";

const tl = require("azure-pipelines-task-lib/task");
const execute = require('./execute');

(function() {
    const version = tl.getInput('version', false);
    console.log("version: ", version);

    const location = tl.getInput("location", false);
    console.log("location: ", location);

    const executeArgs = tl.getInput('executeArgs', false);
    console.log('execute: ', executeArgs);

    const x11Display = tl.getInput('x11Display', false);
    console.log('x11 display:', x11Display);

    const xvfbConfiguration = tl.getInput('xvfbConfiguration', false);
    console.log('xvfbConfiguration: ', xvfbConfiguration);

    const dirPath = tl.cwd();
    console.log('dirPath: ', dirPath);

    execute({
        version,
        location,
        executeArgs,
        x11Display,
        xvfbConfiguration,
        dirPath
    });
})();