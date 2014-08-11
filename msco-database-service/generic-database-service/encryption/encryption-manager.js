
'use strict';

var forge = require('node-forge'),
    fs = require('fs');

var EncryptionManager = (function () {

    var _tokens = {};
    var _options;
    var _cache = {
        encrypt: {},
        decrypt: {}
    };

    function _readPrivateKey(keyPath) {
        return forge.pki.privateKeyFromPem(fs.readFileSync(keyPath));
    }

    function _readPublicKey(keyPath) {
        return forge.pki.publicKeyFromPem(fs.readFileSync(keyPath));
    }

    function _readCertificate(certPath) {
        return forge.pki.certificateFromPem(fs.readFileSync(certPath));
    }

    //-- Constructor
    return function (options) {
        if (typeof options === 'undefined' || (!options.privateKey && (!options.publicKey && !options.certificate))) {
            throw new Error('Private PKI key, Public PKI key, or Public x509 certificate required.');
        }
        _options = {
            cacheTokens: options.cacheTokens || false,
            cacheResults: options.cacheResults || false,
            scheme: options.scheme || 'RSAES-OAEP',

            privateKey: options.privateKey,
            publicKey: options.publicKey,
            certificate: options.certificate,
        };

        if (_options.privateKey && !fs.existsSync(_options.privateKey)) {
            throw new Error('Invalid path to private key.');
        }

        if (_options.publicKey && !fs.existsSync(_options.publicKey)) {
            throw new Error('Invalid path to public key.');
        }

        if (_options.certificate && !fs.existsSync(_options.certificate)) {
            throw new Error('Invalid path to certificate.');
        }

        this.getPrivateToken = function () {
            if (!_options.privateKey) {
                throw new Error('Private token functionality requires Private PKI key.');
            }

            if (_options.cacheTokens && !_tokens.privateKey) {
                _tokens.privateToken = _readPrivateKey(_options.privateKey);
            }

            return _tokens.privateToken ?
                    _tokens.privateToken :
                    _readPrivateKey(_options.privateKey);
        };

        this.getPublicToken = function () {
            if (!_options.publicKey && !_options.certificate) {
                throw new Error('Public token functionality requires Public PKI Key or x509 Certificate.');
            }

            if (_options.cacheTokens && !_tokens.publicToken) {
                _tokens.publicToken = _options.publicKey ? _readPublicKey(_options.publicKey) : _readCertificate(_options.certificate);
            }

            return _tokens.publicToken ?
                    _tokens.publicToken :
                    _options.publicKey ?
                        _readPublicKey(_options.publicKey) :
                        _readCertificate(_options.certificate).publicKey;
        };

        this.encrypt = function (plaintext) {
            if (_options.cacheResults && _cache.encrypt[plaintext]) {
                return _cache.encrypt[plaintext];
            }

            var ciphertext = new Buffer(this.getPublicToken().encrypt(plaintext, _options.scheme)).toString('base64');

            if (_options.cacheResults) {
                _cache.encrypt[plaintext] = ciphertext;
            }

            return ciphertext;
        };

        this.decrypt = function (ciphertext) {
            if (_options.cacheResults && _cache.decrypt[ciphertext]) {
                return _cache.decrypt[ciphertext];
            }

            var plaintext = this.getPrivateToken().decrypt(new Buffer(ciphertext, 'base64').toString(), _options.scheme);

            if (_options.cacheResults) {
                _cache.decrypt[ciphertext] = plaintext;
            }

            return plaintext;
        };
    };
})();

module.exports = EncryptionManager;