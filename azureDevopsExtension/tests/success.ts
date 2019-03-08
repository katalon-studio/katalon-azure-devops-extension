import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('version', 'version');
tmr.setInput('location', 'katalon');
tmr.setInput('executeArgs', 'executeArgs');
tmr.setInput('x11Display', 'x11Display');
tmr.setInput('xvfbConfiguration', 'xvfbConfiguration');

console.log("Call success");

tmr.run();