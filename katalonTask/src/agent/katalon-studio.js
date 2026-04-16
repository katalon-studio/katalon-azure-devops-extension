const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const file = require('./file');
const http = require('./http');
const defaultLogger = require('./logger');
const os = require('./os');

const releasesList = 'https://raw.githubusercontent.com/katalon-studio/katalon-studio/master/releases.json';

function find(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    return;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i += 1) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      const file = find(filename, filter, callback);
      if (!_.isEmpty(file)) {
        // eslint-disable-next-line consistent-return
        return file;
      }
    } else if (filter.test(filename)) {
      // eslint-disable-next-line consistent-return
      return filename;
    }
  }
}

function getKsLocation(ksVersionNumber, ksLocation) {
  if (!ksVersionNumber && !ksLocation) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject("Please specify 'ksVersionNumber' or 'ksLocation'");
  }

  if (ksLocation) {
    return Promise.resolve({
      ksLocationParentDir: ksLocation,
    });
  }

  return http.request(releasesList, '', {}, 'GET')
    .then(({ body }) => {
      const osVersion = os.getVersion();

      let resolvedVersionNumber = ksVersionNumber;
      if (ksVersionNumber === 'latest') {
        defaultLogger.info(`Finding latest version of OS: ${osVersion}`)
        const osReleases = body.filter(item => item.os === osVersion);
        if (osReleases.length === 0) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(`No releases found for OS: ${osVersion}`);
        }
        osReleases.sort((a, b) => {
          const pa = a.version.split('.').map(Number);
          const pb = b.version.split('.').map(Number);
          for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
            const diff = (pb[i] || 0) - (pa[i] || 0);
            if (diff !== 0) return diff;
          }
          return 0;
        });
        resolvedVersionNumber = osReleases[0].version;
        defaultLogger.info(`Resolved 'latest' to Katalon Studio version ${resolvedVersionNumber}.`);
      }

      const ksVersion = body.find(item => item.version === resolvedVersionNumber
        && item.os === osVersion);

      const fileName = ksVersion.filename;
      const fileExtension = path.extname(fileName);
      if (!['.zip', '.gz'].includes(fileExtension)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(`Unexpected file name ${fileName}`);
      }

      const userhome = os.getUserHome();
      const ksLocationParentDir = path.join(userhome, '.katalon', `KRE-${resolvedVersionNumber}`);
      const katalonDoneFilePath = path.join(ksLocationParentDir, '.katalon.done');

      if (fs.existsSync(katalonDoneFilePath)) {
        return Promise.resolve({ ksLocationParentDir });
      }

      defaultLogger.info(`Download Katalon Studio ${resolvedVersionNumber} to ${ksLocationParentDir}.`);
      return file.downloadAndExtract(ksVersion.url, ksLocationParentDir, false)
        .then(() => {
          fs.writeFileSync(katalonDoneFilePath, '');
          return Promise.resolve({ ksLocationParentDir });
        });
    });
}

module.exports = {

  execute(ksVersionNumber, ksLocation, ksProjectPath, ksArgs,
    x11Display, xvfbConfiguration, logger = defaultLogger) {
    return getKsLocation(ksVersionNumber, ksLocation)
      .then(({ ksLocationParentDir }) => {
        logger.info(`Katalon Folder: ${ksLocationParentDir}`);
        let ksExecutable = find(ksLocationParentDir, /katalonc$|katalonc\.exe$|katalon$|katalon\.exe$/);
        logger.info(`Katalon Executable File: ${ksExecutable}`);

        if (!os.getVersion().includes('Windows')) {
          fs.chmodSync(ksExecutable, '755');
        }

        if (ksExecutable.indexOf(' ') >= 0) {
          ksExecutable = `"${ksExecutable}"`;
        }
        let ksCommand = `${ksExecutable}`;

        if (ksArgs.indexOf('-noSplash') < 0) {
          ksCommand = `${ksCommand} -noSplash`;
        }

        if (ksArgs.indexOf('-runMode=console') < 0) {
          ksCommand = `${ksCommand} -runMode=console`;
        }

        if (ksArgs.indexOf('-projectPath') < 0) {
          ksCommand = `${ksCommand} -projectPath="${ksProjectPath}"`;
        }

        ksArgs= ksArgs.replace('-consoleLog', '').replace('-noExit', '');

        ksCommand = `${ksCommand} ${ksArgs}`;
        logger.info(`Execute Katalon Studio: ${ksCommand}`);
        if (logger !== defaultLogger) {
          defaultLogger.debug(`Execute Katalon Studio command: ${ksCommand}`);
        }
        return os.runCommand(ksCommand, x11Display, xvfbConfiguration, logger);
      });
  },

  getKsLocation,
};
