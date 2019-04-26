"use strict";

global.appRoot = '.';

const tl = require("azure-pipelines-task-lib/task");
const path = require('path');
const glob = require('glob');
const ks = require('./agent/katalon-studio');

var version, location, executeArgs, x11Display, xvfbConfiguration, ksProjectPath;

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

        const projectFilePattern = "**/*.prj";
        const dirPath = tl.cwd();

        // console.log(dirPath);
        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        const resultFind = glob.sync(projectPathPattern, { nodir: true });
        [ksProjectPath] = resultFind;
        // console.log(resultFind);
        console.log('ksProjectPath: ', ksProjectPath);

        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
            .then(()=> {
                console.log("Kalaton Studio execute done!");
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