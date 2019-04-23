"use strict";

var childProcess = require('child_process');

var os = require('os');

var tmp = require('tmp');

var defaultLogger = require('./logger');

module.exports = {
  getUserHome: function getUserHome() {
    return os.homedir();
  },
  getHostName: function getHostName() {
    return os.hostname();
  },
  getVersion: function getVersion() {
    var version = '';
    var type = os.type();

    switch (type) {
      case 'Linux':
        version += 'Linux';
        break;

      case 'Darwin':
        version += 'macOS (app)';
        break;

      case 'Windows_NT':
        version += 'Windows';
        var arch = os.arch();

        switch (arch) {
          case 'x32':
            version += ' 32';
            break;

          case 'x64':
            version += ' 64';
            break;

          default:
            throw "Unsupported architecture: ".concat(arch);
        }

        break;

      default:
        throw "Unsupported OS: ".concat(type);
    }

    return version;
  },
  runCommand: function runCommand(command, x11Display, xvfbConfiguration) {
    var logger = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultLogger;
    var cmd;
    var args = [];
    var type = os.type();
    var shell;
    var cmdTemp;

    if (type === 'Windows_NT') {
      cmdTemp = 'dir';
      cmd = 'cmd';
      args.push('/c');
      args.push("\"".concat(command, "\""));
      shell = true;
    } else {
      cmdTemp = 'ls -l';

      if (x11Display) {
        command = "DISPLAY=".concat(x11Display, " ").concat(command);
      }

      if (xvfbConfiguration) {
        command = "xvfb-run ".concat(xvfbConfiguration, " ").concat(command);
      }

      cmd = 'sh';
      args.push('-c');
      args.push("".concat(command));
      shell = false;
    }

    var tmpDir = tmp.dirSync();
    var tmpDirPath = tmpDir.name;
    logger.info("Execute \"".concat(cmd, " ").concat(args.join(' '), "\" in ").concat(tmpDirPath, "."));
    var promise = new Promise(function (resolve) {
      var cmdProcess = childProcess.spawn(cmd, args, {
        cwd: tmpDirPath,
        shell: shell
      });
      cmdProcess.stdout.on('data', function (data) {
        console.log(data.toString());
      });
      cmdProcess.stderr.on('data', function (data) {
        console.log(data.toString());
      });
      cmdProcess.on('close', function (code) {
        console.log("Exit code: ".concat(code, "."));
        resolve(code);
      });
    });
    return promise;
  }
};