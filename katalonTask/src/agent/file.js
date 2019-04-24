const decompress = require('decompress');
const tmp = require('tmp');

const http = require('./http');
const defaultLogger = require('./logger');

module.exports = {

  downloadAndExtract(url, targetDir, logger = defaultLogger) {
    logger.info(`Downloading from ${url}. It may take a few minutes.`);
    const file = tmp.fileSync();
    const filePath = file.name;
    return http.stream(url, filePath)
      .then(() => {
        logger.info(`Decompressing the file into ${targetDir}.`);
        return decompress(filePath, targetDir, {
          filter: (decompressFile) => {
            const decompressPath = decompressFile.path;
            if (decompressPath.includes('.git/') || decompressPath.includes('__MACOSX')) {
              console.log(decompressPath);
            }
            return !decompressPath.includes('.git/') && !decompressPath.includes('__MACOSX');
          },
        });
      });
  },
};
