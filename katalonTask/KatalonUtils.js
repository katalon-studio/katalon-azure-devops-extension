const fs = require('fs');
const decompress = require('decompress');
const mkdirp = require('mkdirp');
const path = require('path');
const homedir = require('os').homedir();
const request = require('request');
var release = require('./KatalonRelease');
var OsUtils = require('./OsUtils');

function ExecuteKatalon(version, location, projectPath, executeArgs, x11Display, xvfbConfiguration, callback) {
    release.getObjectKatalon(version, function(katalon) {
        var url = katalon.url;
        var name = katalon.filename;
        console.log(katalon);

        var workerDir = path.join(homedir, '.katalon');

        if (!fs.existsSync(workerDir)) {
            mkdirp(workerDir);
        }
    
        var versionDir = path.join(workerDir, version);

        if (!fs.existsSync(versionDir)) {
            mkdirp(versionDir);
        }
    
        var fileZipDir = path.join(versionDir, name);
        var katalonFolder = path.join(versionDir, getName(name));
        
        var fileDone = path.join(katalonFolder, ".done");
        if (fs.existsSync(fileDone)) {
            console.log("Katalon Studio package has been downloaded already.");
        } else {
            console.log("Downloading Katalon Studio from " + version + ". It may take a few seconds.")

            request(url).pipe(fs.createWriteStream(fileZipDir)).on('finish', () => { 
                decompress(fileZipDir, versionDir).then(files => {
                    OsUtils.runCommand(katalonFolder, location, projectPath, executeArgs, x11Display, xvfbConfiguration);

                    fs.unlink(fileZipDir, (err) => {
                        if (err) throw err;
                    });
                    fs.writeFile(path.join(katalonFolder, ".done"), "Download done at " + new Date(), (err) => {
                        if (err) throw err;
                        console.log(katalonFolder);
                    });
                });
             });
            }
        return callback(katalonFolder);    
    })  
}

function getName(name) {
    if ((indexOf = name.lastIndexOf(".zip")) > 0) {
        return name.substring(0, indexOf);
    } else if ((indexOf = name.lastIndexOf(".tar.gz")) > 0) {
        return name.substring(0, indexOf);
    } else if ((indexOf = name.lastIndexOf(".dmg")) > 0) {
        return name.substring(0, indexOf);
    }
    var indexOf = name.lastIndexOf(".");
    return name.substring(0, indexOf);
}

module.exports.ExecuteKatalon = ExecuteKatalon;