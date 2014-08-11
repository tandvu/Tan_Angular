#!/usr/bin/env node

'use strict';

var commander = require('commander'),
    EncryptionManager = require('../encryption-manager');

commander
    .version(require('../../package.json').version)
    .option('-k, --key [key file]', 'PEM private key to utilize for decryption.')
    .usage('[options] <credentials>')
    .parse(process.argv);

if (!commander.key) {
    console.error('ERROR: A private key file is required.');
    process.exit(1);
}

if (commander.args.length === 0) {
    console.error('ERROR: Credentials to decrypt is required.');
    process.exit(1);
}

var encryptionManager = new EncryptionManager({
    privateKey: commander.key,
    certificate: commander.cert
});

console.log(encryptionManager.decrypt(commander.args[0]));