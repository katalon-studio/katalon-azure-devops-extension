const childProcess = require('child_process');
const os = require('os');
const tmp = require('tmp');

const defaultLogger = require('./logger');

module.exports = {

  getUserHome() {
    return os.homedir();
  },

  getHostName() {
    return os.hostname();
  },

  getVersion() {
    let version = '';
    const type = os.type();
    switch (type) {
      case 'Linux':
        version += 'Linux';
        break;
      case 'Darwin':
        version += 'macOS (app)';
        break;
      case 'Windows_NT':
        version += 'Windows';
        const arch = os.arch();
        switch (arch) {
          case 'x32':
            version += ' 32';
            break;
          case 'x64':
            version += ' 64';
            break;
          default:
            throw `Unsupported architecture: ${arch}`;
        }
        break;
      default:
        throw `Unsupported OS: ${type}`;
    }
    return version;
  },

  runCommand(command, x11Display, xvfbConfiguration, logger = defaultLogger) {
    let cmd;
    const args = [];
    const type = os.type();
    let shell;
    let env = process.env;
    env.ECLIPSE_SANDBOX = '1.11';
    if (type === 'Windows_NT') {
      cmd = 'cmd';
      args.push('/c');
      args.push(`"${command}"`);
      shell = true;
    } else {
      if (x11Display) {
        command = `DISPLAY=${x11Display} ${command}`;
      }
      if (xvfbConfiguration) {
        command = `xvfb-run ${xvfbConfiguration} ${command}`;
      }
      cmd = 'sh';
      args.push('-c');
      args.push(`${command}`);
      shell = false;
    }
    const tmpDir = tmp.dirSync();
    const tmpDirPath = tmpDir.name;
    logger.info(`Execute "${cmd} ${args.join(' ')}" in ${tmpDirPath}.`);
    const promise = new Promise((resolve) => {
      const cmdProcess = childProcess.spawn(cmd, args, {
        cwd: tmpDirPath,
        shell,
        env,
      });
      cmdProcess.stdout.on('data', (data) => {
        logger.debug(data.toString());
      });
      cmdProcess.stderr.on('data', (data) => {
        logger.debug(data.toString());
      });
      cmdProcess.on('close', (code) => {
        logger.info(`Exit code: ${code}.`);
        resolve(code);
      });
    });
    return promise;
  },
};
