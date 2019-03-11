import tl = require('azure-pipelines-task-lib/task');
// import getKatalon = require("ge");
// import getKatalon = require("./DownloadTask");

var version : string,
    location: string,
    executeArgs: string,
    x11Display: string,
    xvfbConfiguration: string;

async function run() {
    try {
        const version = tl.getInput('version', true);

        if (version == 'version'){
            console.log("Version not found");
        } else {
            console.log("version: ", version)
        }

        const location = tl.getInput("location", true);

        if (location == 'location'){
            console.log("location not found");
        } else {
            console.log("location: ", location);
        }

        const executeArgs = tl.getInput('executeArgs', true);

        if (executeArgs == 'executeArgs'){
            console.log('execute not found');
        } else {
            console.log('execute: ', executeArgs);
        }

        const x11Display = tl.getInput('x11Display', true);
        if (x11Display == 'x11Display'){
            console.log('x11 not found');
        } else {
            console.log('x11 display:', x11Display);
        }

        const xvfbConfiguration = tl.getInput('xvfbConfiguration', true);
        if (xvfbConfiguration == 'xvfbConfiguration'){
            console.log('xvfbConfiguration not found');
        } else {
            console.log('xvfbConfiguration: ', xvfbConfiguration);
        }

        var userHome = require('user-home');

        console.log(userHome);
        
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();