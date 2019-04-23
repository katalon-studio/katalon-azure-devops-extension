"use strict";

var path = require('path');

module.exports = {
  getPath: function getPath(relativePath) {
    return path.join(global.appRoot, relativePath);
  }
};