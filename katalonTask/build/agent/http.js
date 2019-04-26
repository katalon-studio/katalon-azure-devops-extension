"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _ = require('lodash');

var fs = require('fs');

var _request = require('request');

var urljoin = require('url-join');

var logger = require('./logger');

var config = require('./config');

function buildOptions(url, headers, options) {
  var defaultOptions = {
    url: url,
    headers: headers || {},
    strictSSL: false
  };
  var proxy = config.proxy;

  if (proxy) {
    defaultOptions = _objectSpread({}, defaultOptions, {
      proxy: proxy
    });
  }

  options = _.merge(defaultOptions, options || {});
  return options;
}

module.exports = {
  stream: function stream(url, filePath) {
    logger.info("Downloading from ".concat(url, " to ").concat(filePath, "."));
    var promise = new Promise(function (resolve) {
      var method = 'GET';
      var options = buildOptions(url, {}, {
        method: method
      });

      _request(options).pipe(fs.createWriteStream(filePath)).on('finish', function () {
        logger.info('Finished downloading.');
        resolve();
      });
    });
    return promise;
  },
  request: function request(baseUrl, relativeUrl, options, method) {
    var headers = {
      'content-type': 'application/json',
      accept: 'application/json'
    };
    var url = urljoin(baseUrl, relativeUrl);
    options = buildOptions(url, headers, _objectSpread({}, options, {
      json: true,
      method: method
    }));
    logger.debug('REQUEST:\n', options);
    var promise = new Promise(function (resolve, reject) {
      _request(options, function (error, response, body) {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          logger.info("".concat(method, " ").concat(response.request.href, " ").concat(response.statusCode, "."));
          resolve({
            status: response.statusCode,
            body: body
          });
        }
      });
    }).then(function (response) {
      response.requestUrl = options.url;
      logger.debug('RESPONSE:\n', response);
      return response;
    });
    return promise;
  },
  uploadToS3: function uploadToS3(signedUrl, filePath) {
    var stats = fs.statSync(filePath);
    var headers = {
      'content-type': 'application/octet-stream',
      accept: 'application/json',
      'Content-Length': stats.size
    };
    var method = 'PUT';
    var options = buildOptions(signedUrl, headers, {
      method: method,
      json: true
    });
    var promise = new Promise(function (resolve, reject) {
      fs.createReadStream(filePath).pipe(_request(options, function (error, response, body) {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          logger.info("".concat(method, " ").concat(response.request.href, " ").concat(response.statusCode, "."));
          resolve({
            status: response.statusCode,
            body: body
          });
        }
      }));
    });
    return promise;
  }
};