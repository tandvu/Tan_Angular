'use strict';

var commander = require('commander'),
    fs = require('fs'),
    EncryptionManager = require('../encryption/encryption-manager');

function parseCommandLine(argv) {

    commander
        .version(require('../package.json').version)
        .option('-p, --port [port number]', 'interface port to open [8080]', 8080)
        .option('--mongo-host [mongodb host]', 'hostname for MongoDB instance [localhost]', 'localhost')
        .option('--mongo-port [mongodb port]', 'port for MongoDB instance [27017]', 27017)
        .option('--mongo-options [options file]', 'optional MongoDB options JSON file')
        .option('--mongo-credentials [credentials file]', 'optional MongoDB credentials JSON file')
        .option('-k, --key [key file]', 'optional private PKI key in PEM format for decrypting encrypted credential information')
        .option('--auth ["msco", "trust", "dev"]', 'specify authentication module to use', 'msco')
        .option('--auth-options [options file]', 'authentication options JSON file')
        .option('--no-development', 'disable development mode logging')
        .parse(argv || process.argv);

    // Base configuration values
    var configuration = {
        port: commander.port,
        isDevelopment: commander.development,
        mongodbHost: commander.mongoHost,
        mongodbPort: commander.mongoPort,
        mongodbOptions: commander.mongoOptions ? JSON.parse(fs.readFileSync(commander.mongoOptions)) : {w: 1},
        mongodbCredentials: commander.mongoCredentials ? JSON.parse(fs.readFileSync(commander.mongoCredentials)) : {},
    };

    // Passport authentication configuration
    var Strategy;
    if (commander.auth === 'trust') {
        console.log('WARNING: Fully trusting passport authentication module ENABLED!');
        console.log('WARNING: Do not run this module in a production environment!');

        Strategy = new require('../passport/passport-trust').Strategy;
    }
    else if (commander.auth === 'dev') {
        console.log('WARNING: Development passport authentication module ENABLED!');
        console.log('WARNING: Do not run this module in a production environment!');

        Strategy = new require('../passport/passport-dev').Strategy;
    }
    else if (commander.auth === 'msco') {
        Strategy = new require('../passport/passport-mscoauth').Strategy;
    }
    else {
        console.error('ERROR: --auth must specify one of "msco", "trust", or "dev"');
        process.exit(1);
    }

    configuration.passportStrategy = new Strategy(commander.authOptions ? JSON.parse(fs.readFileSync(commander.authOptions)) : {}, configuration);

    // Decrypt password if required
    if (commander.key && configuration.mongodbCredentials.password) {
        configuration.mongodbCredentials.password = new EncryptionManager({privateKey : commander.key}).decrypt(configuration.mongodbCredentials.password);
    }

    return configuration;
}

module.exports = parseCommandLine;