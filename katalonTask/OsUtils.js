const childProcess = require('child_process');
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
  let katalonDirPath = "";
  if (!location) {
    katalonDirPath = katalonFolder;
  } else {
    katalonDirPath = location;
  }
  let cmd;
  const args = [];
  const type = os.type();
  let shell;
  let katalonExecutableFile;
  let checkFolder; 
  const locationCloneProject = tl.cwd();
  executeArgs = `${executeArgs} -noSplash -runMode=console`;

  if (executeArgs.indexOf("-projectPath") < 0) {
    var projectPath = path.join(tl.cwd(), "test.prj");
    executeArgs = `${executeArgs} -projectPath="${projectPath}"`;
  } 

  if (type === 'Windows_NT') {
    checkFolder = "dir";
    katalonExecutableFile = path.join(katalonDirPath, "katalon");
    cmd = 'cmd';
    args.push('/c');
    args.push(`${katalonExecutableFile}`)
    args.push(`${executeArgs}`);
    shell = true;

  } else {
    checkFolder = 'ls -l'
    childProcess.exec("chmod a+x katalon", {
      cwd: katalonDirPath,
      shell: true
    }, function(error, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (error) throw error;
    }) 

    katalonExecutableFile = path.join(katalonDirPath, "katalon");

    args.push('-c \'');
    if (x11Display) {
      args.push(`DISPLAY=${x11Display}`);
    }
    if (xvfbConfiguration) {
      args.push(`xvfb-run ${xvfbConfiguration}`);
    }

    cmd = 'sh';
    args.push(`${katalonExecutableFile}`)
    args.push(`${executeArgs}\'`);
    shell = true;
  }

  childProcess.exec(checkFolder, {
    cwd: katalonDirPath,
    shell: true
  }, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (error) throw error;
  }) 
  
  childProcess.exec(checkFolder, {
    cwd: locationCloneProject,
    shell: true
  }, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (error) throw error;
  }) 

  const tmpDir = tmp.dirSync();
  const tmpDirPath = tmpDir.name;
  console.log(`Execute "${cmd} ${args.join(' ')}" in ${tmpDirPath}.`);

  const promise = new Promise((resolve) => {
    const cmdProcess = childProcess.spawn(cmd, args, {
      cwd: tmpDirPath,
      shell,
    });
    cmdProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    cmdProcess.stderr.on('data', (data) => {
      console.log(data.toString());
    });
    cmdProcess.on('close', (code) => {
      console.log(`Exit code: ${code}.`);
      resolve(code);
    });
  });
  return promise;
  
}


module.exports.runCommand = runCommand;