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

function sortByVersionDesc(releases) {
  if (!releases || releases.length === 0) return [];
  return releases.slice().sort((a, b) => {
    const pa = a.version.split('.').map(Number);
    const pb = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      const diff = (pb[i] || 0) - (pa[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

function resolveVersionNumber(ksVersionNumber, osVersion, releases) {
  const osReleases = releases.filter(item => item.os === osVersion);

  // "latest" — newest release overall
  if (ksVersionNumber === 'latest') {
    defaultLogger.info(`Finding latest version for OS: ${osVersion}`);
    const sorted = sortByVersionDesc(osReleases);
    const resolved = sorted.length > 0 ? sorted[0].version : null;
    if (resolved) defaultLogger.info(`Resolved 'latest' to Katalon Studio version ${resolved}.`);
    return resolved;
  }

  // "<major>-latest" — newest release within a given major version, e.g. "11-latest"
  const majorLatestMatch = ksVersionNumber.match(/^(\d+)-latest$/);
  if (majorLatestMatch) {
    const major = parseInt(majorLatestMatch[1], 10);
    defaultLogger.info(`Finding latest version for major ${major} and OS: ${osVersion}`);
    const majorReleases = osReleases.filter(item => parseInt(item.version.split('.')[0], 10) === major);
    const sorted = sortByVersionDesc(majorReleases);
    const resolved = sorted.length > 0 ? sorted[0].version : null;
    if (resolved) defaultLogger.info(`Resolved '${ksVersionNumber}' to Katalon Studio version ${resolved}.`);
    return resolved;
  }

  // exact version — return as-is
  return ksVersionNumber;
}

function resolveVersion(ksVersionNumber) {
  return http.request(releasesList, '', {}, 'GET')
    .then(({ body }) => {
      const osVersion = os.getVersion();
      const resolved = resolveVersionNumber(ksVersionNumber, osVersion, body);
      if (!resolved) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(`No matching release found for version '${ksVersionNumber}' and OS: ${osVersion}`);
      }
      const release = body.find(item => item.version === resolved && item.os === osVersion);
      return { version: resolved, url: release.url, filename: release.filename };
    });
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

  return resolveVersion(ksVersionNumber)
    .then(({ version: resolvedVersionNumber, url, filename }) => {
      const fileExtension = path.extname(filename);
      if (!['.zip', '.gz'].includes(fileExtension)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject(`Unexpected file name ${filename}`);
      }

      const userhome = os.getUserHome();
      const ksLocationParentDir = path.join(userhome, '.katalon', `KRE-${resolvedVersionNumber}`);
      const katalonDoneFilePath = path.join(ksLocationParentDir, '.katalon.done');

      if (fs.existsSync(katalonDoneFilePath)) {
        return Promise.resolve({ ksLocationParentDir });
      }

      defaultLogger.info(`Download Katalon Studio ${resolvedVersionNumber} to ${ksLocationParentDir}.`);
      return file.downloadAndExtract(url, ksLocationParentDir, false)
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

  resolveVersion,
};
