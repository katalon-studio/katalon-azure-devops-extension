const fs = require('fs');
const unzip = require('unzip');
const mkdirp = require('mkdirp');
const path = require('path');
const homedir = require('os').homedir();
const request = require('request');
var release = require('./KatalonRelease');

// const url = "https://github.com/katalon-studio/katalon-studio/releases/download/v5.10.1/Katalon_Studio_Windows_32-5.10.1.zip";
// const name = "Katalon_Studio_Windows_32-5.10.1.zip";
const version = "5.10.1";

function DownloadAndExtract(version, callback) {
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
            console.log(fs.readFileSync(fileDone, 'utf8'));
        } else {
            request(url).pipe(fs.createWriteStream(fileZipDir)).on('finish', function () { 
                fs.createReadStream(fileZipDir).pipe(unzip.Extract({path: versionDir})).on('finish', () => {
                    fs.unlink(fileZipDir, (err) => {
                        if (err) throw err;
                        console.log("Deleted zip done");
                    })
                    fs.writeFile(path.join(katalonFolder, ".done"), "Download done at " + new Date(), (err) => {
                        if (err) throw err;
                        console.log("Done");
                    });
                    
                });
             });
            }
            return katalonFolder;    
    })  
    
    }

function getName(name) {
    var indexOf = name.lastIndexOf(".");
    return name.substring(0, indexOf);
}

module.exports.DownloadAndExtract = DownloadAndExtract;

var dir = DownloadAndExtract(version);
// console.log(dir);