// const constants = require()
const fs = require('fs');
const unzip = require('unzip');
const mkdirp = require('mkdirp');
const path = require('path');
const homedir = require('os').homedir();
const express = require('express');
const request = require('request');

const workerDir = path.join(homedir, '.katalon');

const url = "https://github.com/katalon-studio/katalon-studio/releases/download/v5.10.1/Katalon_Studio_Windows_32-5.10.1.zip";
const name = "Katalon_Studio_Windows_32-5.10.1.zip";
const folder = "Katalon_Studio_Windows_32-5.10.1";
const version = "5.10.1";

console.log(workerDir);

if (!fs.existsSync(workerDir)){
    // @ts-ignore
    mkdirp(workerDir);
}

const destDir = path.join(workerDir, version);

const dirFileZip = path.join(destDir, name);

if (!fs.existsSync(destDir)){
    // @ts-ignore
    mkdirp(destDir);
}
console.log("Get forder to save katalon done");

download = function(callback){
    request(url).pipe(fs.createWriteStream(dirFileZip));
    return callback = true;
};

extract = function(callback){
    fs.createReadStream(dirFileZip).pipe(unzip.Extract({ path: destDir }));
    return callback = true;
}

var toDownload = download(function(callback){
    console.log("Extractingg");
    extract(function(callback){
        fs.unlink(toSave, (err) => {
            if (err) throw err;
            console.log('Deleted done');
          });
    });
    console.log("Download done!");
});

const folderDirKatalon = path.join(destDir, folder);

// Notification to download and extract done
// var done = fs.writeFile(path.join(folderDirKatalon, ".done"), "Downloaded at " + new Date(), function(err) {
//     if(err) {
//         return console.log(err);
//     }
//     console.log("The file was saved!");
// }); 

