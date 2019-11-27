"use strict";

global.appRoot = '.';

const tl = require("azure-pipelines-task-lib/task");
const path = require('path');
const glob = require('glob');
const ks = require('./agent/katalon-studio');
const logger = require('./agent/logger');

module.exports = function({ version, location, executeArgs, x11Display, xvfbConfiguration, dirPath }) {
    try {
        const projectFilePattern = "**/*.prj";

        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        const [ksProjectPath] = glob.sync(projectPathPattern, { nodir: true });
        logger.info('ksProjectPath:', ksProjectPath);

        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
            .then((code)=> {
                logger.info(`Exit code ${code}.`);
                if (code === 0) {
                    tl.setResult(tl.TaskResult.Succeeded);
                } else {
                    tl.setResult(tl.TaskResult.Failed);
                }
            })
            .catch((error) => {
                tl.setResult(tl.TaskResult.Failed, error.message);
                logger.info(error);
            })
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
};