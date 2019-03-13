const child = require('child_process');
const os = require('os');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');

const homedir = os.homedir();


function getOS() {
  var osCurrent = os.platform().toString();

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
  return osCurrent;
};

function getKatalonDir(version) {
  var workerDir = path.join(homedir, '.katalon');

  var versionDir = path.join(workerDir, version);
  
  return versionDir;
}

function runCommand(katalonFolder, version, location, projectPath, executeArgs, x11Display, xvfbConfiguration) {
  var homeDirectory = getKatalonDir(version);

  var katalonDirPath = "";
  if (!location) {
    katalonDirPath = katalonFolder;
  } else {
    katalonDirPath = location;
  }

  console.log("Using Katalon Studio at " + katalonDirPath);

  var osVersion = getOS();
  var command = "";
  var katalonExecutableFile = "";

  if (osVersion.indexOf("masOS") >= 0) {
    katalonExecutableFile =  path.join(katalonDirPath, "Contents", "MacOS", "katalon");
  } else {
    katalonExecutableFile = path.join(katalonDirPath, "katalon");
  }

  if (osVersion.indexOf("Windows") < 0) {
    command = "sh -c " + katalonExecutableFile;
    if(x11Display) {
      command += " DISPLAY=" + x11Display;
    }
    if(xvfbConfiguration) {
      command += " xvfb-run " + xvfbConfiguration;
    }
  } else {
    command = "cmd /c " + katalonExecutableFile;
  }

  command += " -noSplash " + " -runMode=console ";

  command += executeArgs;
  
  if (command.indexOf("-projectPath") < 0) {
    command += " -projectPath=\"" + projectPath + "\" ";
  }

  workingDirectory = path.join(homeDirectory, "katalon-");
  if (!fs.existsSync(workingDirectory)) {
    mkdirp(workingDirectory);
  }

  console.log("Execute " + command + " in " + workingDirectory);

  child.exec(command, {
    cwd: workingDirectory,
    shell: true
  }, function(error, stdout, stderr) {
    if (error) throw error;
    console.log(stdout);
    console.log("Run katalon done");
    return true;
  })
}

module.exports.runCommand = runCommand;

var katalonFolder = "C:\\Users\\tuananhtran\\.katalon\\5.10.1\\Katalon_Studio_Windows_64-5.10.1";
var version = "5.10.1";
var location = "";
var projectPath = "D:\\Katalon\\demo-azure\\CI-sample";
var executeArgs = "-retry=0 -testSuitePath=\"Test Suites/TS_RegressionTest\" -executionProfile=\"default\" -browserType=\"Chrome\"";
var x11Display = "";
var xvfbConfiguration = "";


runCommand(katalonFolder, version, location, projectPath, executeArgs, x11Display, xvfbConfiguration);