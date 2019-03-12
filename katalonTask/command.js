const nodeCmd = require('node-cmd');


const des = "C:\\Users\\tuananhtran\\.katalon\\5.10.1\\Katalon_Studio_Windows_32-5.10.1"
const execute = "katalon -noSplash  -runMode=console -consoleLog -projectPath=\"C:\\Users\\tuananhtran\\Katalon Studio\\Test.prj\\Jira API Tests with Katalon Studio.prj\" -retry=0 -testSuitePath=\"Test Suites/Data-driven tests\" -executionProfile=\"default\" -browserType=\"Web Service\"";

// console.log(des);

// nodeCmd.get('cd ' + des, (err, data, stderr) => console.log(data));
// nodeCmd.get("dir", (err, data, stderr) => console.log(data));

// // nodeCmd.get(execute, (err, data, stderr) => console.log(data));

// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// async function ls() {
// //   const { stdout, stderr } = await exec('cd /d' + des);
//     const {stdout, stderr} = await exec('pushd ' + des);
//   const { stdoutt, stderrr } = await exec('dir');
// }
// ls();

var exec = require('child_process').exec;
var cmd = 'pushd ' + des;

exec(cmd, function(error, stdout, stderr) {
  // command output is in stdout
  exec('dir', function(error, stdout, stderr) { //ls
      console.log(stdout);
  });
});