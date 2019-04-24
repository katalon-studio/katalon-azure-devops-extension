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
        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        [ksProjectPath] = glob.sync(projectPathPattern, { nodir: true });

        console.log(ksProjectPath);

        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
            .then(()=> {
                tl.setResult(tl.TaskResult.Succeeded, "run katalon succes");
            })
            .catch((error) => {
                tl.setResult(tl.TaskResult.Failed, error.message);
                console.log(error);
            })
    }
    catch (err) {
        console.log(err);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();