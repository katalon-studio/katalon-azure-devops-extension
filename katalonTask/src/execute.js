"use strict";

global.appRoot = '.';

const tl = require("azure-pipelines-task-lib/task");
const path = require('path');
const glob = require('glob');
const ks = require('./agent/katalon-studio');

module.exports = function({ version, location, executeArgs, x11Display, xvfbConfiguration, dirPath }) {
    try {
        const projectFilePattern = "**/*.prj";

        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        const resultFind = glob.sync(projectPathPattern, { nodir: true });
        const [ksProjectPath] = resultFind;
        console.log('ksProjectPath: ', ksProjectPath);

        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
            .then((code)=> {
                console.log(`Exit code ${code}.`);
                if (code === 0) {
                    tl.setResult(tl.TaskResult.Succeeded);
                } else {
                    tl.setResult(tl.TaskResult.Failed);
                }
            })
            .catch((error) => {
                tl.setResult(tl.TaskResult.Failed, error.message);
                console.log(error);
            })
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
};