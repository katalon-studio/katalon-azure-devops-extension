const http = require('https');
const fs = require('fs');
const os = require('os');

const file = fs.createWriteStream("releases.temp");

var releases = "https://raw.githubusercontent.com/katalon-studio/katalon-studio/master/releases.json";

const version = "5.10.1";

var osCurrent = os.platform();
if (osCurrent == "win32"){
    if (os.arch() == "x64"){
        osCurrent = "win64";
    }
}

switch(osCurrent){
    case "win32":
        osCurrent = "Windows 32";
        break;
    case "win64":
        osCurrent = "Windows 64";
        break;
    case "mac":
        osCurrent = "masOS";
        break;
    case "linux":
        osCurrent = "Linux";
        break;
}

console.log(osCurrent);

function getObjectKatalon(callback) {
    http.get(releases, function(response) {
        //   response.pipe(file);
            // console.log(response.pipe);
            var body = '';

            response.on('data', function(d){
                body += d;
            });

            response.on('end', function(){
                var parsed = JSON.parse(body);
                for (i in parsed){
                    if(parsed[i].version == version){
                        if (parsed[i].os == osCurrent){
                            objectKatalon = parsed[i];
                            
                            return callback(objectKatalon);
                        }
                    }
                }
            });
        });
    }


getObjectKatalon(function(objectKatalon){
    console.log(objectKatalon.url);
});

