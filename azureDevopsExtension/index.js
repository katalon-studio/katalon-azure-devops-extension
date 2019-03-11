"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tl = require("azure-pipelines-task-lib/task");
const https = require('https');
const fs = require('fs');
const os = require('os');

const releases = "https://raw.githubusercontent.com/katalon-studio/katalon-studio/master/releases.json";

var version, location, executeArgs, x11Display, xvfbConfiguration;

var osCurrent = os.platform();
if (osCurrent == "win32"){
    if (os.arch() == "x64"){
        osCurrent = "win64";
    }
}

switch(osCurrent){
    case "win32":
        osCurrent = "Windows 32";
        break;
    case "win64":
        osCurrent = "Windows 64";
        break;
    case "mac":
        osCurrent = "masOS";
        break;
    case "linux":
        osCurrent = "Linux";
        break;
}

console.log(osCurrent);

function getObjectKatalon(callback) {
    https.get(releases, function(response) {
            var body = '';
            console.log("Call here");
            response.on('data', function(d){
                body += d;
            });

            response.on('end', function(){
                var parsed = JSON.parse(body);
                for (var i in parsed){
                    if(parsed[i].version == version){
                        if (parsed[i].os == osCurrent){
                            var objectKatalon = parsed[i];
                            
                            return callback(objectKatalon);
                        }
                    }
                }
            });
        });
    }

function run(callback) {
    return __awaiter(this, void 0, void 0, function () {
        // var version_1, location_1, executeArgs_1, x11Display_1, xvfbConfiguration_1, userHome;
        return __generator(this, function (_a) {
            try {
                version = tl.getInput('version', true);
                // version = "5.10.1";
                if (version == 'version') {
                    console.log("Version not found");
                }
                else {
                    console.log("version: ", version);
                    getObjectKatalon(function(objectKatalon){
                        console.log(objectKatalon.url);
                    })
                }
                location = tl.getInput("location", true);
                if (location == 'location') {
                    console.log("location not found");
                }
                else {
                    console.log("location: ", location);
                }
                executeArgs = tl.getInput('executeArgs', true);
                if (executeArgs == 'executeArgs') {
                    console.log('execute not found');
                }
                else {
                    console.log('execute: ', executeArgs);
                }
                x11Display = tl.getInput('x11Display', true);
                if (x11Display == 'x11Display') {
                    console.log('x11 not found');
                }
                else {
                    console.log('x11 display:', x11Display);
                }
                xvfbConfiguration = tl.getInput('xvfbConfiguration', true);
                if (xvfbConfiguration == 'xvfbConfiguration') {
                    console.log('xvfbConfiguration not found');
                }
                else {
                    console.log('xvfbConfiguration: ', xvfbConfiguration);
                }
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
            return [2 /*return*/];
        });
    });
}



run(function(callback){

});
