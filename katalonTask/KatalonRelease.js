const http = require('https');
const os = require('os');

const releases = "https://raw.githubusercontent.com/katalon-studio/katalon-studio/master/releases.json";

function getOS() {
    var osCurrent = os.platform().toString();

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
    return osCurrent;
};

function getObjectKatalon(version, callback) {
    var osCurrent = getOS();

    http.get(releases, function(response) {
            var body = '';

            response.on('data', function(d) {
                body += d;
            });

            response.on('end', function() {
                var parsed = JSON.parse(body);

                for (var i in parsed){
                    if (parsed[i].version == version) {
                        if (parsed[i].os == osCurrent) {
                            var objectKatalon = parsed[i];
                            return callback(objectKatalon);
                        }
                    }
                }
            });
        });
    }

module.exports.getObjectKatalon = getObjectKatalon;