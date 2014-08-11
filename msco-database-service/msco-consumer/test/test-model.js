'use strict';

var assert = require('assert'),
    async = require('async'),
    mongoose = require('mongoose'),
    MscoConsumer = require('..');

describe('MscoConsumer function tests', function () {
    
    describe('MscoConsumer#setConnection', function () {

        it('test specific setConnection', function (done) {
            MscoConsumer.setConnection('mongodb://localhost/test-msco-consumer', function (err) {
                assert(!err);

                assert.equal(mongoose.connection.host, 'localhost');
                assert.equal(mongoose.connection.port, 27017);
                assert.equal(mongoose.connection.name, 'test-msco-consumer');
                done();
            });
        });
    });
});

describe('msco-consumer creation tests.', function () {

    describe('default DatabaseAccess constructor', function () {
        var DatabaseAccess = MscoConsumer.DatabaseAccess();

        it('valid DatabaseAccess construction', function (done) {
            new DatabaseAccess({
                name: 'databaseName',
                access: 'read'
            }).validate(function (err) {
                assert(!err);
                done();
            });
        });

        it('invalid DatabaseAccess model overwrite', function (done) {
            assert.throws(function () {
                MscoConsumer.DatabaseAccess({
                    access: ['foo', 'bar']
                });
            }, mongoose.Error.OverwriteModelError);
            done();
        });

        it('undefined DatabaseAccess creation', function (done) {
            new DatabaseAccess(undefined)
                .validate(function (err) {
                    assert(err instanceof mongoose.Error.ValidationError);
                    done();
                });
        });

        it('empty DatabaseAccess creation', function (done) {
            new DatabaseAccess({}).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });

        it('missing DatabaseAccess.name value', function (done) {
            new DatabaseAccess({
                access: 'manage'
            }).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });

        it('missing DatabaseAccess.access value', function (done) {
            new DatabaseAccess({
                name: 'databaseName'
            }).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });
    });

    describe('Role model ', function () {
        var Role = MscoConsumer.Role;
        var DatabaseAccess = MscoConsumer.DatabaseAccess();

        it('valid Role construction', function (done) {
            new Role({
                name: 'master',
            }).validate(function (err) {
                assert(!err);
                done();
            });
        });

        it('valid Role construction with DatabaseAccess document', function (done) {
            new Role({
                name: 'master',
                databases: [
                    new DatabaseAccess({
                        name: 'databaseName',
                        access: 'read'
                    })
                ]
            }).validate(function (err) {
                assert(!err);
                done();
            });
        });

        it('undefined Role creation', function (done) {
            new Role(undefined)
                .validate(function (err) {
                    assert(err instanceof mongoose.Error.ValidationError);
                    done();
                });
        });

        it('empty Role creation', function (done) {
            new Role({}).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });

    });

    describe('default Consumer constructor', function () {
        var Consumer = MscoConsumer.Consumer();

        it('valid Consumer construction', function (done) {
            new Consumer({
                identifier: 'id'
            }).validate(function (err) {

                assert(!err);
                done();
            });
        });

        it('invalid Consumer model overwrite', function (done) {
            assert.throws(function () {
                MscoConsumer.Consumer({
                    credentials: null
                });
            }, mongoose.Error.OverwriteModelError);
            done();
        });

        it('undefined Consumer creation', function (done) {
            new Consumer(undefined)
                .validate(function (err) {
                    assert(err instanceof mongoose.Error.ValidationError);
                    done();
                });
        });

        it('empty Consumer creation', function (done) {
            new Consumer({}).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });

        it('valid Consumer construction with Role document', function (done) {
            var DatabaseAccess = MscoConsumer.DatabaseAccess();

            new Consumer({
                identifier: 'id',
                roles: [new MscoConsumer.Role({
                    name: 'master',
                    databases: [
                        new DatabaseAccess({
                            name: 'databaseName',
                            access: 'read'
                        })
                    ]
                })]
            }).validate(function (err) {

                assert(!err);
                done();
            });
        });

        it('valid Consumer construction with embedded Credentials', function (done) {
            new Consumer({
                identifier: 'id',
                credentials: {
                    apitoken: String,
                    apisalt: String
                }
            }).validate(function (err) {
                assert(!err);
                done();
            });
        });

        it('invalid Consumer missing Consumer.identifier value with Role document', function (done) {
            var DatabaseAccess = MscoConsumer.DatabaseAccess();

            new Consumer({
                roles: [new MscoConsumer.Role({
                    name: 'master',
                    databases: [
                        new DatabaseAccess({
                            name: 'databaseName',
                            access: 'read'
                        })
                    ]
                })]
            }).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });

        it('invalid Consumer missing Consumer.identifier value with embedded Credentials', function (done) {
            new Consumer({
                credentials: {
                    apitoken: String,
                    apisalt: String
                }
            }).validate(function (err) {
                assert(err instanceof mongoose.Error.ValidationError);
                done();
            });
        });
    });

    describe('Consumer model method tests', function () {

        var DatabaseAccess = MscoConsumer.DatabaseAccess();
        var Role = MscoConsumer.Role;
        var Consumer = MscoConsumer.Consumer();

        // Clear relevant collections before running each test
        beforeEach(function (done) {
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
            ], function (err) {
                done(err);
            });
        });

        it('valid Consumer#getRoles no roles', function (done) {
            new Consumer({
                identifier: 'id',
                roles: []
            }).save(function (err, consumer) {
                consumer.getRoles(function (err, roles) {
                    assert(!err);
                    assert.equal(roles.length, 0);

                    done();
                });
            });
        });


        it('valid Consumer#getRoles 1 role', function (done) {
            async.waterfall([

                function (callback) {
                    new DatabaseAccess({
                        name: 'databaseName',
                        access: 'read'
                    }).save(callback);
                },
                function (objDatabaseAccess, numberAffected, callback) {
                    new Role({
                        name: 'master',
                        databases: [objDatabaseAccess]
                    }).save(callback);
                },
                function (objRole, numberAffected, callback) {
                    new Consumer({
                        identifier: 'id',
                        roles: [objRole]
                    }).save(callback);
                }
            ], function (err, consumer) {
                assert(!err);

                consumer.getRoles(function (err, roles) {
                    assert(!err);
                    assert.equal(roles.length, 1);
                    assert.equal(roles[0].databases.length, 1);

                    done();
                });
            });
        });

        it('valid Consumer#getDatabaseAccess', function (done) {
            async.waterfall([

                function (callback) {
                    new DatabaseAccess({
                        name: 'databaseName',
                        access: 'read'
                    }).save(callback);
                },
                function (objDatabaseAccess, numberAffected, callback) {
                    new Role({
                        name: 'master',
                        databases: [objDatabaseAccess]
                    }).save(callback);
                },
                function (objRole, numberAffected, callback) {
                    new Consumer({
                        identifier: 'id',
                        roles: [objRole]
                    }).save(callback);
                }
            ], function (err, consumer) {
                assert(!err);

                async.parallel([

                    function (callback) {
                        consumer.getDatabaseAccess('databaseName', function (err, databaseAccess) {
                            assert(!err);
                            assert.equal(databaseAccess.length, 1);
                            assert.equal(databaseAccess[0].name, 'databaseName');

                            callback();
                        });
                    },
                    function (callback) {
                        consumer.getDatabaseAccess('thisIsNotRightAtAll', function (err, databaseAccess) {
                            assert(!err);
                            assert.equal(databaseAccess.length, 0);

                            callback();
                        });
                    },
                ], function (err) {
                    done(err);
                });
            });
        });
    });
});