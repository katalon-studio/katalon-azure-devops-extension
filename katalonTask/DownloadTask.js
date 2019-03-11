// @ts-nocheck
const fs = require('fs');
const unzip = require('unzip');
const mkdirp = require('mkdirp');
const path = require('path');
const homedir = require('os').homedir();
const request = require('request');

// const url = "https://github.com/katalon-studio/katalon-studio/releases/download/v5.10.1/Katalon_Studio_Windows_32-5.10.1.zip";
// const name = "Katalon_Studio_Windows_32-5.10.1.zip";
// const folder = "Katalon_Studio_Windows_32-5.10.1";
// const version = "5.10.1";

function DownloadAndExtract(version, url, name, callback) {
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
    }

function getName(name) {
    var indexOf = name.lastIndexOf(".");
    return name.substring(0, indexOf);
}

// var dir = DownloadAndExtract(version, url, name);
// console.log(dir);