var tmp = require('tmp');
 
tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
  if (err) throw err;
 
  console.log('Dir: ', path);
  
  // Manual cleanup
  cleanupCallback();
});