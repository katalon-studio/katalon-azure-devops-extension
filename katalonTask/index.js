"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
var version, location, executeArgs, x11Display, xvfbConfiguration;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = tl.getInput('version', true);
            if (version == 'version') {
                console.log("Version not found");
            }
            else {
                console.log("version: ", version);
            }
            const location = tl.getInput("location", true);
            if (location == 'location') {
                console.log("location not found");
            }
            else {
                console.log("location: ", location);
            }
            const executeArgs = tl.getInput('executeArgs', true);
            if (executeArgs == 'executeArgs') {
                console.log('execute not found');
            }
            else {
                console.log('execute: ', executeArgs);
            }
            const x11Display = tl.getInput('x11Display', true);
            if (x11Display == 'x11Display') {
                console.log('x11 not found');
            }
            else {
                console.log('x11 display:', x11Display);
            }
            const xvfbConfiguration = tl.getInput('xvfbConfiguration', true);
            if (xvfbConfiguration == 'xvfbConfiguration') {
                console.log('xvfbConfiguration not found');
            }
            else {
                console.log('xvfbConfiguration: ', xvfbConfiguration);
            }
            var userHome = require('user-home');
            console.log(userHome);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
