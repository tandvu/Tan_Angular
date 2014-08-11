'use strict';

var commander = require('commander'),
    fs = require('fs');

function parseCommandLine() {
    commander
        .version(require('../package.json').version)
        .option('-p, --port [port number]', 'interface port to open [8080]', 8080)
        .option('--mongo-host [mongodb host]', 'Hostname for MongoDB instance [localhost]', 'localhost')
        .option('--mongo-port [mongodb port]', 'Port for MongoDB instance [27017]', 27017)
        .option('--mongo-options [options file]', 'MongoDB options JSON file')
        .option('--security-options [options file]', 'Security options JSON file')
        .option('-d, --development', 'enable development mode')
        .parse(process.argv);

    return {
        port: commander.port,
        isDevelopment: commander.development,
        mongodbHost: commander.mongoHost,
        mongodbPort: commander.mongoPort,
        mongodbOptions: commander.mongoOptions ? JSON.parse(fs.readFileSync(commander.mongoOptions)) : {},
        securityOptions: commander.securityOptions ? JSON.parse(fs.readFileSync(commander.securityOptions)) : {}
    };
}

module.exports = parseCommandLine();