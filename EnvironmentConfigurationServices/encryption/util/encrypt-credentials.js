#!/usr/bin/env node

'use strict';

var commander = require('commander'),
    util = require('util'),
    EncryptionManager = require('../encryption-manager');

commander
    .version(require('../../package.json').version)
    .option('-c, --cert [certificate file]', 'x509 public certificate to utilize for encryption.')
    .option('-k, --key [key file]', 'PEM public key to utilize for encryption.')
    .usage('[options] <credentials>')
    .parse(process.argv);

if (!commander.cert && !commander.key) {
    console.error('ERROR: A public certificate or key file is required.');
    process.exit(1);
}

if (commander.args.length === 0) {
    console.error('ERROR: Credentials to encrypt is required.');
    process.exit(1);
}

var encryptionManager = new EncryptionManager({
    publicKey: commander.key,
    certificate: commander.cert
});

var getPublicToken = encryptionManager.getPublicToken();

var maxLength = Math.ceil(getPublicToken.n.bitLength() / 8) - 11;

if (commander.args[0].length > maxLength) {
    console.error(util.format('ERROR: Credentials are too large to encrypt. Maximum size for %d-bit token is %d bytes.', getPublicToken.n.bitLength(), maxLength));
    process.exit(1);
}

console.log(encryptionManager.encrypt(commander.args[0]));
