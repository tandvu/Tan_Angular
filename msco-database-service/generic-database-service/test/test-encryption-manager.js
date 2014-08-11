'use strict';

var assert = require('assert'),
    EncryptionManager = require('../encryption/encryption-manager');

describe('credentials decryption tests.', function () {

    var ciphertext = 'Bi9pTg/DlsKmwpkxw53DiMKgw4fDoXx/Y2wdw6PDvsKvwrJ7wpnDtcOxwoHCvcOKw5lFQy81w5dwJ8Oww6wNaQ/DsyPCsMK0AU/CqMO5wqHDhMOvYsOjRMKXw7jClsKPwp/Drl9Jw4MFwozCogjDvg17SsOhwoHDpMK9w6/CkT7Cvz/ClMKAaAN4OcOxwpXCjMKTbsOWQ8KAw5VfL0RCw5XCn8Kyw53CskDChcO5AcKJRAchw4vCiVMPT8Okw7vCsT7DlcKWw4Nuwo3DqAYOwq7CpMKywpXDq8KUw4R6RQcaw4VQwrLDhGUJwpZ9bMKEb2XClcOqwpkuTMOPQ0k/CiDCi8KgwrrDqcKnAsOPR2YNwpRCwptAwpbCiQPDhDPChwPDuMKIZMKdw6sYw4VwKMKfwqU4wozDhsOEwq7DpDnCosONwr1Cw5UYwrfCuyohS8ORwrXCnkTDuThZGsKTbcOfLjTClFbCgXhoMMKxKsO3wrYIw7zCiCTCosOYYANzOnHCg8OVw4nDiSF8';

    it('null parameters', function (done) {
        assert.throws(function () { new EncryptionManager(); }, Error);
        done();
    });

    it('empty parameters', function (done) {
        assert.throws(function () { new EncryptionManager({}); }, Error);
        done();
    });

    it('invalid private key path', function (done) {
        assert.throws(function () {
            new EncryptionManager({
                privateKey: './test/pki/nonexistent.private.key'
            });
        }, Error);
        done();
    });

    it('invalid public key path', function (done) {
        assert.throws(function () {
            new EncryptionManager({
                publicKey: './test/pki/nonexistent.public.key'
            });
        }, Error);
        done();
    });

    it('invalid certificate path', function (done) {
        assert.throws(function () {
            new EncryptionManager({
                certificate: './test/pki/nonexistent.certificate.crt'
            });
        }, Error);
        done();
    });

    it('invalid ciphertext encoding', function (done) {
        var encryptionManager;

        assert.doesNotThrow(function () {
            encryptionManager = new EncryptionManager({
                publicKey: './test/pki/test.public.key'
            });
        });

        assert(encryptionManager);

        assert.throws(function () {
            encryptionManager.decrypt('this is not base64');
        }, 'Error');
        done();
    });

    it('invalid ciphertext value', function (done) {
        var encryptionManager;

        assert.doesNotThrow(function () {
            encryptionManager = new EncryptionManager({
                privateKey: './test/pki/test.private.key'
            });
        });

        assert(encryptionManager);

        assert.throws(function () {
            encryptionManager.decrypt('a2xhYXR1IGJhcmFkYSBuaWt0bw==');
        }, 'Error');

        done();
    });

    it('valid private key', function (done) {
        var encryptionManager;

        assert.doesNotThrow(function () {
            encryptionManager = new EncryptionManager({
                privateKey: './test/pki/test.private.key'
            });
        });

        assert(encryptionManager);


        assert.equal(encryptionManager.decrypt(ciphertext), 'klaatu barada nikto');
        done();
    });

    it('valid public key plus decryption', function (done) {
        var encryptionManager;
        var plaintext = 'klaatu barada nikto';

        assert.doesNotThrow(function () {
            encryptionManager = new EncryptionManager({
                privateKey: './test/pki/test.private.key',
                publicKey: './test/pki/test.public.key'
            });
        });

        assert(encryptionManager);

        var encrypted = encryptionManager.encrypt(plaintext);

        assert.equal(encryptionManager.decrypt(encrypted), plaintext);
        done();
    });

    it('valid certificate plus decryption', function (done) {
        var encryptionManager;
        var plaintext = 'klaatu barada nikto';

        assert.doesNotThrow(function () {
            encryptionManager = new EncryptionManager({
                privateKey: './test/pki/test.private.key',
                certificate: './test/pki/test.crt'
            });
        });

        assert(encryptionManager);

        var encrypted = encryptionManager.encrypt(plaintext);

        assert.equal(encryptionManager.decrypt(encrypted), plaintext);
        done();
    });    
});