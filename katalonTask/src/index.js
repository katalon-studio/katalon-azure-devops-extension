"use strict";

const tl = require("azure-pipelines-task-lib/task");
const execute = require('./execute');

(function() {
    const version = tl.getInput('version', false);
    console.log('Download Katalon Studio version:', version);

    const location = tl.getInput('location', false);
    console.log('Use pre-installed Katalon Studio:', location);

    const executeArgs = tl.getInput('executeArgs', false);
    console.log('Command arguments:', executeArgs);

    const x11Display = tl.getInput('x11Display', false);
    console.log('X11 DISPLAY (for Linux):', x11Display);

    const xvfbConfiguration = tl.getInput('xvfbConfiguration', false);
    console.log('Xvfb-run configuration (for Linux):', xvfbConfiguration);

    const dirPath = tl.cwd();
    console.log('Working directory: ', dirPath);

    execute({
        version,
        location,
        executeArgs,
        x11Display,
        xvfbConfiguration,
        dirPath
    });
})();