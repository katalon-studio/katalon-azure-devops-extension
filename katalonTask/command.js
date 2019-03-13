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
  if (location == "") {
    katalonDirPath = katalonFolder;
  } else {
    katalonDirPath = location;
  }

  console.log("Using Katalon Studio at " + katalonDirPath);

  var osVersion = getOS();
  var command = "";

  if (osVersion.indexOf("Windows") < 0) {
    if(x11Display != "") {
      command = "DISPLAY=" + x11Display + " " + command;
    }
    if(xvfbConfiguration.length != "") {
      command = "xvfb-run " + xvfbConfiguration + " " + command;
    }
  }

  var katalonExecutableFile = "";

  if (osVersion.indexOf("masOS") >= 0) {
    katalonExecutableFile =  path.join(katalonDirPath, "Contents", "MacOS", "katalon");
  } else {
    katalonExecutableFile = path.join(katalonDirPath, "katalon");
  }

  command = katalonExecutableFile + " -noSplash " + " -runMode=console ";

  command += executeArgs;
  
  if (command.indexOf("-projectPath") < 0) {
    command = command + " -projectPath=\"" + projectPath + "\" ";
  }

  workingDirectory = path.join(homeDirectory, "katalon-");
  if (!fs.existsSync(workingDirectory)) {
    mkdirp(workingDirectory);
  }

  console.log("Execute " + command + " in " + workingDirectory);

  child.exec(command, {
    cwd: workingDirectory
  }, function(error, stdout, stderr) {
    if (error) throw error;
    console.log(stdout);
    console.log("Run katalon done");
    return true;
  })
}

module.exports.runCommand = runCommand;

// var katalonFolder = "C:\\Users\\tuananhtran\\.katalon\\5.10.1\\Katalon_Studio_Windows_64-5.10.1";
// var version = "5.10.1";
// var location = "";
// var projectPath = "D:\\Katalon\\demo-azure\\CI-sample";
// var executeArgs = "-retry=0 -testSuitePath=\"Test Suites/TS_RegressionTest\" -executionProfile=\"default\" -browserType=\"Chrome\"";
// var x11Display = "";
// var xvfbConfiguration = "";


// runCommand(katalonFolder, version, location, projectPath, executeArgs, x11Display, xvfbConfiguration);