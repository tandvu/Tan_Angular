'use strict';

var assert = require('assert'),
    parse = require('../config/parse');

describe('configuration tests.', function () {

    describe('standard command line instantiations', function () {

        it('empty-ish arguments', function (done) {
            assert.deepEqual(
                parse(['node', 'generic-database-server.js', '--auth', 'trust', '--no-development']),
                { port: 8080,
                  isDevelopment: false,
                  mongodbHost: 'localhost',
                  mongodbPort: 27017,
                  mongodbOptions: { w: 1 },
                  mongodbCredentials: {},
                  passportStrategy: { name: 'trust' }
                });
            done();
        });

        it('development mode', function (done) {
            assert.deepEqual(
                parse(['node', 'generic-database-server.js', '--auth', 'trust']),
                { port: 8080,
                  isDevelopment: true,
                  mongodbHost: 'localhost',
                  mongodbPort: 27017,
                  mongodbOptions: { w: 1 },
                  mongodbCredentials: {},
                  passportStrategy: { name: 'trust' }
                });

            done();
        });

        it('mongo options', function (done) {
            assert.deepEqual(
                parse(['node', 'generic-database-server.js', '--auth', 'trust', '--no-development', '--mongo-host', 'servername', '--mongo-port', '27018']),
                { port: 8080,
                  isDevelopment: false,
                  mongodbHost: 'servername',
                  mongodbPort: 27018,
                  mongodbOptions: { w: 1 },
                  mongodbCredentials: {},
                  passportStrategy: { name: 'trust' }
                });
            done();
        });

        it('authentication options', function (done) {
            var config = parse(['node', 'generic-database-server.js', '--auth', 'dev', '--no-development', '--auth-options', 'test/config/auth.json']);
            assert.equal(config.passportStrategy._identityHeader, 'X-Auth-ROT13');
            done();
        });
    });

    describe('mongodb credentials', function () {

        it('no key', function (done) {
            var config = parse(['node', 'generic-database-server.js', '--auth', 'trust', '--no-development', '--mongo-credentials', 'test/config/credentials-cleartext.json']);

            assert.equal(config.mongodbCredentials.username, 'testUsername');
            assert.equal(config.mongodbCredentials.password, 'klaatu barada nikto');

            done();
        });

        it('with key', function (done) {
            var config = parse(['node', 'generic-database-server.js', '--auth', 'trust', '--no-development', '--mongo-credentials', 'test/config/credentials-encrypted.json', '-k', 'test/pki/test.private.key']);

            assert.equal(config.mongodbCredentials.username, 'testUsername');
            assert.equal(config.mongodbCredentials.password, 'klaatu barada nikto');

            done();
        });
    });
});