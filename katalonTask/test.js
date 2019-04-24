global.appRoot = '.';

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

        xvfbConfiguration = '-a -n 0 -s \"screen 0 1024x768x24\"';
        console.log('xvfbConfiguration: ', xvfbConfiguration);

        const projectFilePattern = "**/*.prj";
        const dirPath = 'D:\\Katalon\\demo-azure\\ci-samples';
        const projectPathPattern = path.resolve(dirPath, projectFilePattern);
        [ksProjectPath] = glob.sync(projectPathPattern, { nodir: true });

        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        ksProjectPath = ksProjectPath.replaceAll("/", "\\")
        console.log(ksProjectPath);
        ks.execute(version, location, ksProjectPath, executeArgs,
            x11Display, xvfbConfiguration)
        .catch((error) => {
            console.log(error);
        })
    }
    catch (err) {
        console.log(err);
        // tl.setResult(tl.TaskResult.Failed, err.message);
    }
    return [2 /*return*/];
}

console.log('def');
run();