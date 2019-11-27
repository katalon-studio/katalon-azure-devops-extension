const _ = require('lodash');
const fs = require('fs');
const request = require('request');
const urljoin = require('url-join');

const logger = require('./logger');
const config = require('./config');

function buildOptions(url, headers, options) {
  let defaultOptions = {
    url,
    headers: headers || {},
    strictSSL: false,
  };
  const { proxy } = config;
  if (proxy) {
    defaultOptions = {
      ...defaultOptions,
      proxy,
    };
  }
  options = _.merge(defaultOptions, options || {});
  return options;
}

module.exports = {
  stream(url, filePath, opts = {}) {
    logger.info(`Downloading from ${url} to ${filePath}.`);
    const promise = new Promise((resolve) => {
      const method = 'GET';
      const options = buildOptions(
        url,
        {},
        {
          ...opts,
          method,
        },
      );
      request(options)
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          logger.info('Finished downloading.');
          resolve();
        });
    });
    return promise;
  },

  request(baseUrl, relativeUrl, options, method) {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json',
    };
    const url = urljoin(baseUrl, relativeUrl);
    options = buildOptions(url, headers, {
      ...options,
      json: true,
      method,
    });
    const promise = new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          logger.info(`${method} ${response.request.href} ${response.statusCode}.`);
          resolve({ status: response.statusCode, body });
        }
      });
    }).then((response) => {
      response.requestUrl = options.url;
      return response;
    });
    return promise;
  },
};
