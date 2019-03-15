const child = require('child_process');
const os = require('os');
const path = require('path');
const tmp = require('tmp');
const tl = require("azure-pipelines-task-lib/task");

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

function runCommand(katalonFolder, location, executeArgs, x11Display, xvfbConfiguration) {
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

    child.exec("chmod a+x katalon", {
      cwd: katalonFolder,
      shell: true
    }, function(error, stdout, stderr) {
      if (error) throw error;
      console.log(stdout);
    }) 

    if(x11Display) {
      command += " DISPLAY=" + x11Display;
    }

    if(xvfbConfiguration) {
      command += "xvfb-run " + xvfbConfiguration;
    }

    command += " " + katalonExecutableFile;

  } else {
    
    command = katalonExecutableFile;
  }

  command += " -noSplash " + " -runMode=console ";

  if (command.indexOf("-projectPath") < 0) {
    var projectPath = path.join(tl.cwd(), "test.prj");
    command += " -projectPath=\"" + projectPath + "\" ";
  }

  command += executeArgs;

  tmp.dir(function _tempDirCreated(err, workingDirectory, cleanupCallback) {
    if (err) throw err;

    console.log("Execute [" + command + "] in " + workingDirectory);
    child.execFile('sh', ['-c', command], {
      cwd: workingDirectory
    }, function(error, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (error) throw error;
    })
  })
}

module.exports.runCommand = runCommand;