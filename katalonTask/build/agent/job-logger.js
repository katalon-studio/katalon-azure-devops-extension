"use strict";

var winston = require('winston');

var winstonLogFormat = winston.format.combine(winston.format.timestamp(), winston.format.printf(function (_ref) {
  var level = _ref.level,
      message = _ref.message,
      timestamp = _ref.timestamp;
  return "[".concat(timestamp, "] [").concat(level.toUpperCase(), "]: ").concat(message);
}));
var logger = {
  getLogger: function getLogger(filename) {
    return winston.createLogger({
      level: 'debug',
      format: winstonLogFormat,
      transports: [new winston.transports.Console(), new winston.transports.File({
        filename: filename
      })]
    });
  }
};
module.exports = logger;