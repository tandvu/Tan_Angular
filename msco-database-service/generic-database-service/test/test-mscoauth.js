'use strict';

var MscoConsumer = require('msco-consumer'),
    assert = require('assert'),
    async = require('async'),
    supertest = require('supertest'),
    mscoDatabaseWorker = require('../generic-database-worker'),
    MscoAuthStrategy = require('../passport/passport-mscoauth').Strategy;

var testConfiguration = {
    mongodbHost: 'localhost',
    mongodbPort: 27017,
    mongodbOptions: {w: 1},
};

testConfiguration.passportStrategy = new MscoAuthStrategy({
    authDatabase: 'test-msco-auth'
}, testConfiguration);

function clearAuthenticationData(DatabaseAccess, Role, Consumer, callback) {
    async.parallel([

        function (callback) {
            DatabaseAccess.remove(callback);
        },
        function (callback) {
            Role.remove(callback);
        },
        function (callback) {
            Consumer.remove(callback);
        }
    ], callback);
}

describe('passport-mscoauth access tests.', function () {

    describe('empty auth db tests', function () {

        var app;

        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);
            done();
        });

        after(function (done) {
            app.emit('shutdown');
            done();
        });

        it('GET without access', function (done) {
            supertest(app)
                .get('/test-generic-database-service/authCollection')
                .expect(401, done);
        });

        it('POST without access', function (done) {
            supertest(app)
                .post('/test-generic-database-service/authCollection')
                .expect(401, done);
        });

        it('PUT without access', function (done) {
            supertest(app)
                .put('/test-generic-database-service/authCollection/012345678901234567890123')
                .expect(401, done);
        });

        it('DELETE without access', function (done) {
            supertest(app)
                .delete('/test-generic-database-service/authCollection/012345678901234567890123')
                .expect(401, done);
        });
    });

    describe('database read only tests', function () {

        var app;

        var DatabaseAccess = MscoConsumer.DatabaseAccess();
        var Role = MscoConsumer.Role;
        var Consumer = MscoConsumer.Consumer();

        // Clear relevant collections before running each test
        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);

            clearAuthenticationData(DatabaseAccess, Role, Consumer, function (err) {
                assert(!err);

                async.waterfall([

                    function (callback) {
                        new DatabaseAccess({
                            name: 'test-generic-database-service',
                            access: 'read'
                        }).save(callback);
                    },
                    function (objDatabaseAccess, numberAffected, callback) {
                        new Role({
                            name: 'readonly',
                            databases: [objDatabaseAccess]
                        }).save(callback);
                    },
                    function (objRole, numberAffected, callback) {
                        new Consumer({
                            identifier: 'readOnlyConsumer',
                            roles: [objRole]
                        }).save(callback);
                    }
                ], function (err) {
                    done(err);
                });
            });
        });


        after(function (done) {
            app.emit('shutdown');
            clearAuthenticationData(DatabaseAccess, Role, Consumer, done);
        });

        it('GET with read access', function (done) {
            supertest(app)
                .get('/test-generic-database-service/authCollection')
                .set('X-Auth-Identity', 'readOnlyConsumer')
                .expect(200, done);
        });

        it('POST without manage access', function (done) {
            supertest(app)
                .post('/test-generic-database-service/authCollection')
                .set('X-Auth-Identity', 'readOnlyConsumer')
                .expect(401, done);
        });

        it('PUT without manage access', function (done) {
            supertest(app)
                .put('/test-generic-database-service/authCollection/012345678901234567890123')
                .set('X-Auth-Identity', 'readOnlyConsumer')
                .expect(401, done);
        });

        it('DELETE without manage access', function (done) {
            supertest(app)
                .delete('/test-generic-database-service/authCollection/012345678901234567890123')
                .set('X-Auth-Identity', 'readOnlyConsumer')
                .expect(401, done);
        });
    });

    describe('database manage tests', function () {

        var app;

        var DatabaseAccess = MscoConsumer.DatabaseAccess();
        var Role = MscoConsumer.Role;
        var Consumer = MscoConsumer.Consumer();

        // Clear relevant collections before running each test
        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);

            clearAuthenticationData(DatabaseAccess, Role, Consumer, function (err) {
                assert(!err);

                async.waterfall([

                    function (callback) {
                        new DatabaseAccess({
                            name: 'test-generic-database-service',
                            access: 'manage'
                        }).save(callback);
                    },
                    function (objDatabaseAccess, numberAffected, callback) {
                        new Role({
                            name: 'manage',
                            databases: [objDatabaseAccess]
                        }).save(callback);
                    },
                    function (objRole, numberAffected, callback) {
                        new Consumer({
                            identifier: 'manageConsumer',
                            roles: [objRole]
                        }).save(callback);
                    }
                ], function (err) {
                    done(err);
                });
            });
        });

        after(function (done) {
            app.emit('shutdown');
            clearAuthenticationData(DatabaseAccess, Role, Consumer, done);
        });

        it('GET with manage access', function (done) {
            supertest(app)
                .get('/test-generic-database-service/authCollection')
                .set('X-Auth-Identity', 'manageConsumer')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        var _objectId;

        it('POST with manage access', function (done) {
            supertest(app)
                .post('/test-generic-database-service/authCollection')
                .send({
                    foo: 'bar',
                    spaces: 'value with spaces'
                })
                .set('X-Auth-Identity', 'manageConsumer')
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    assert(!err);

                    _objectId = res.body[0]._id;
                    done(err);
                });
        });

        it('PUT with manage access', function (done) {
            supertest(app)
                .put('/test-generic-database-service/authCollection/' + _objectId)
                .set('X-Auth-Identity', 'manageConsumer')
                .send({
                    foo: 'baz',
                    spaces: 'more space'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    assert(!err);

                    assert.equal(res.body._id, _objectId);
                    assert.equal(res.body.foo, 'baz');
                    assert.equal(res.body.spaces, 'more space');

                    done();
                });
        });

        it('DELETE with manage access', function (done) {
            supertest(app)
                .delete('/test-generic-database-service/authCollection/' + _objectId)
                .set('X-Auth-Identity', 'manageConsumer')
                .expect(204, done);
        });
    });
});