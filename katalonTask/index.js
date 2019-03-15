"use strict";

const tl = require("azure-pipelines-task-lib/task");
const child = require('child_process');
const KatalonUtils = require("./KatalonUtils");
var version, location, executeArgs, x11Display, xvfbConfiguration, reportDirectory;

function run() {
    try {
        version = tl.getInput('version', false);
        console.log("version: ", version);

        location = tl.getInput("location", false);
        console.log("location: ", location);

        executeArgs = tl.getInput('executeArgs', false);
        console.log('execute: ', executeArgs);

        x11Display = tl.getInput('x11Display', false);
        console.log('x11 display:', x11Display);

        xvfbConfiguration = tl.getInput('xvfbConfiguration', false);
        console.log('xvfbConfiguration: ', xvfbConfiguration);

        KatalonUtils.ExecuteKatalon(version, location, executeArgs, x11Display, xvfbConfiguration, function(dest) {
            console.log(dest);
        });
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
    return [2 /*return*/];
}

run();