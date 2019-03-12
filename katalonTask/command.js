const child = require('child_process');
const os = require('os');
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
  
  return path.join(versionDir, "katalon.exe");
}

function runCommand(command, x11Display, xvfbConfiguration) {
  version = "////";

  if (getOS().indexOf("Windows") < 0) {
    if(!x11Display.trim()) {
      command = "DISPLAY=" + x11Display + " " + command;
    }
    if(!xvfbConfiguration.trim()) {
      command = "xvfb-run " + xvfbConfiguration + " " + command;
    }
  }
  exe = getKatalonDir(version) + " " + command;

  child.exec(command, {
    cwd: des
  }, function(error, stdout, stderr) {
    console.log("Run test case katalon done!");
  });
}

module.exports.runCommand = runCommand;

// const des = "C:\\Users\\tuananhtran\\.katalon\\5.10.1\\Katalon_Studio_Windows_32-5.10.1"
// const execute = "katalon -noSplash  -runMode=console -consoleLog -projectPath=\"C:\\Users\\tuananhtran\\Katalon Studio\\Test.prj\\Jira API Tests with Katalon Studio.prj\" -retry=0 -testSuitePath=\"Test Suites/Data-driven tests\" -executionProfile=\"default\" -browserType=\"Web Service\"";