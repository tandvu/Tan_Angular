'use strict';

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    async = require('async'),
    supertest = require('supertest'),
    util = require('util'),
    mscoDatabaseWorker = require('../generic-database-worker'),
    PassportTrustStrategy = require('../passport/passport-trust').Strategy;

var testConfiguration = {
    mongodbHost: 'localhost',
    mongodbPort: 27017,
    mongodbOptions: {w: 1},
    passportStrategy: new PassportTrustStrategy()
};

function clearCollection(collectionName, callback) {
    async.waterfall([

        function (callback) {
            MongoClient.connect(util.format('mongodb://%s:%d/%s', testConfiguration.mongodbHost, testConfiguration.mongodbPort, 'test-generic-database-service'), callback);
        },
        function (db, callback) {
            db.collection(collectionName, {
                strict: true
            }, function (err, collection) {
                callback(null, db, collection);
            });
        },
        function (db, collection, callback) {
            if (collection) {
                db.dropCollection(collectionName, function (err) {
                    callback(err, db);
                });
            } else {
                callback(null, db);
            }
        },
        function (db, callback) {
            db.close(callback);
        }
    ], function (err) {
        if (err) {
            console.log(err);
        }
        callback(err);
    });
}

describe('generic-database-worker route tests.', function () {

    describe('Invalid URLs', function () {
        var app;

        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);
            done();
        });

        after(function (done) {
            app.emit('shutdown');
            done();
        });

        it('Invalid /', function (done) {
            supertest(app)
                .get('/')
                .expect(404, done);
        });

        it('Invalid GET /databaseName', function (done) {
            supertest(app)
                .get('/databaseName')
                .expect(404, done);
        });

        it('Invalid POST /databaseName', function (done) {
            supertest(app)
                .post('/databaseName')
                .send({
                    foo: 'bar'
                })
                .expect(404, done);
        });

        it('Invalid PUT /databaseName', function (done) {
            supertest(app)
                .put('/databaseName')
                .expect(404, done);
        });

        it('Invalid PUT /databaseName/collectionName', function (done) {
            supertest(app)
                .put('/databaseName/collectionName')
                .expect(404, done);
        });

        it('Invalid DELETE /databaseName', function (done) {
            supertest(app)
                .delete('/databaseName')
                .expect(404, done);
        });

        it('Invalid DELETE /databaseName/collectionName', function (done) {
            supertest(app)
                .delete('/databaseName/collectionName')
                .expect(404, done);
        });
    });

    describe('Invalid Configuration', function () {
        var app;

        before(function (done) {

            app = mscoDatabaseWorker({
                mongodbHost: 'localhost',
                mongodbPort: 27017,
                mongodbOptions: {w: 1},
                mongodbCredentials: {username: 'wrongusername', password: 'wrongpassword'},
                passportStrategy: new PassportTrustStrategy()
            });

            done();
        });

        after(function (done) {
            app.emit('shutdown');
            done();
        });

        it('Creationary POST to instance with invalid configuration', function (done) {
            supertest(app)
                .post('/test-generic-database-service-invalid/invalidCollection')
                .send({})
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Unexpected database authentication error.');
                    done();
                });
        });
    });

    describe('Insert Tests', function () {
        var app;

        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);
            clearCollection('testCollection', done);
        });

        after(function (done) {
            app.emit('shutdown');
            clearCollection('testCollection', done);
        });

        it('Initial empty collection GET', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Collection testCollection does not exist in database test-generic-database-service.');
                    done();
                });
        });

        it('Initial empty collection GET with ID', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/012345678901234567890123')
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Collection testCollection does not exist in database test-generic-database-service.');
                    done();
                });
        });

        it('Initial empty collection GET GET via object data query', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    spaces: 'value with spaces'
                })
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Collection testCollection does not exist in database test-generic-database-service.');
                    done();
                });
        });

        it('Valid creationary Object POST', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection/foo')
                .send({
                    foo: 'bar',
                    spaces: 'value with spaces',
                    boolValue: true,
                    numericValue: 42
                })
                .expect(200, done);
        });

        it('Invalid creationary POST with additional unique field', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection/bar')
                .send({})
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Can not create additional unique field on existing collection.');
                    done();
                });
        });

        var _objectId;

        it('Created GET object equality', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert('foo' in res.body[0]);
                    assert.equal(res.body[0].foo, 'bar');
                    assert('spaces' in res.body[0]);
                    assert.equal(res.body[0].spaces, 'value with spaces');
                    assert('boolValue' in res.body[0]);
                    assert.equal(res.body[0].boolValue, true);
                    assert('numericValue' in res.body[0]);
                    assert.equal(res.body[0].numericValue, 42);

                    _objectId = res.body[0]._id;
                    done();
                });
        });

        it('GET parallel stress test', function (done) {
            var requests = [];
            var appContainer = supertest(app);

            var parallelFunction = function (callback) {
                appContainer
                    .get('/test-generic-database-service/testCollection')
                    .expect('Content-Type', /json/)
                    .expect(200);

                callback(null);
            };

            for (var i = 0; i < 1000; i++) {
                requests.push(parallelFunction);
            }

            async.parallel(requests, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('GET series stress test', function (done) {
            var requests = [];
            var appContainer = supertest(app);

            var seriesFunction = function (callback) {
                appContainer
                    .get('/test-generic-database-service/testCollection')
                    .expect('Content-Type', /json/)
                    .expect(200);

                callback(null);
            };
                
            for (var i = 0; i < 1000; i++) {
                requests.push(seriesFunction);
            }

            async.series(requests, function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });

        it('Test for new object equality with specified URL', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/' + _objectId)
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    assert('foo' in res.body[0]);
                    assert.equal(res.body[0].foo, 'bar');
                    assert('spaces' in res.body[0]);
                    assert.equal(res.body[0].spaces, 'value with spaces');
                    assert('boolValue' in res.body[0]);
                    assert.equal(res.body[0].boolValue, true);
                    assert('numericValue' in res.body[0]);
                    assert.equal(res.body[0].numericValue, 42);
                    done();
                });
        });

        it('Test for new object GET via object ID query', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    _id: _objectId
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('Test for new object GET via object string data query', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    foo: 'bar'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('Test for new object GET via object string data query with spaces', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    spaces: 'value with spaces'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('Test for new object GET via object numeric data query with spaces', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    numericValue: 42
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('Test for new object GET via object boolean data query with spaces', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    boolValue: true
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it('Test for invalid object GET via object data query', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .query({
                    foo: 'this does not exist'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 0);
                    done();
                });
        });

        it('Invalid creationary POST with _id', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection')
                .send({
                    _id: 'id'
                })
                .expect('Content-Type', /json/)
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Invalid document creation. Do not specify _id parameter.');
                    done();
                });
        });

        it('Valid creationary POST with duplicated uniqueness field', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection/foo')
                .send({
                    foo: 'buzz',
                    spaces: 'value with spaces'
                })
                .expect(200, done);
        });

        it('Updated GET and object equality', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection')
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.length, 3);
                    done();
                });
        });

        it('Invalid non-unique creationary POST', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection')
                .send({
                    foo: 'bar'
                })
                .expect('Content-Type', /json/)
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert(new RegExp('.*duplicate key error.*').test(res.body.error));
                    done();
                });
        });

        it('Ensure pooling does not reuse inapplicable connections', function (done) {
            supertest(app)
                .get('/test-generic-database-service-separate/testCollection')
                .expect('Content-Type', /json/)
                .expect(404, function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it('Valid creationary Array POST', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection')
                .send([{
                    greek: 'alpha'
                }, {
                    greek: 'beta',
                    latin: 'quod erat demonstrandum'
                }, {
                    greek: 'gamma',
                    latin: 'ceteris paribus',
                    japanese: 'かく示された。これが証明すべきことだった。'
                }])
                .expect(200, done);
        });

        it('Invalid creationary Array POST with sparse _id', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection')
                .send([{
                    greek: 'alpha'
                }, {
                    _id: 'id',
                    greek: 'beta',
                    latin: 'quod erat demonstrandum'
                }, {
                    greek: 'gamma',
                    latin: 'ceteris paribus',
                    japanese: 'かく示された。これが証明すべきことだった。'
                }])
                .expect('Content-Type', /json/)
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Invalid document creation. Do not specify _id parameter.');
                    done();
                });
        });

    });

    describe('Update Tests', function () {
        var app;

        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);
            clearCollection('testCollection', done);
        });

        after(function (done) {
            app.emit('shutdown');
            clearCollection('testCollection', done);
        });

        var _objectId;
        it('Valid creationary POST', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection/foo')
                .send({
                    foo: 'bar'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    _objectId = res.body[0]._id;
                    done();
                });
        });

        it('Invalid PUT with nonexistant ID', function (done) {
            supertest(app)
                .put('/test-generic-database-service/testCollection/012345678901234567890123')
                .send({
                    foo: 'buzz'
                })
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'No existing documents match the criteria.');
                    done();
                });
        });

        it('Updated GET and object equality', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/' + _objectId)
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0]._id, _objectId);
                    assert('foo' in res.body[0]);
                    assert.equal(res.body[0].foo, 'bar');
                    done();
                });
        });

        it('Valid updating PUT with ID', function (done) {
            supertest(app)
                .put('/test-generic-database-service/testCollection/' + _objectId)
                .send({
                    foo: 'buzz'
                })
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    assert(!err);

                    assert.equal(res.body._id, _objectId);
                    assert.equal(res.body.foo, 'buzz');
                    done();
                });
        });

        it('Invalid updating PUT with mismatched ID', function (done) {
            supertest(app)
                .put('/test-generic-database-service/testCollection/' + _objectId)
                .send({
                    _id: 'id',
                    foo: 'buzz'
                })
                .expect('Content-Type', /json/)
                .expect(400, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'Mismatch between document _id attribute and requested document ID.');
                    done();
                });
        });

        it('Test for updated object equality with specified URL', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/' + _objectId)
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert.equal(res.body.length, 1);
                    assert('foo' in res.body[0]);
                    assert.equal(res.body[0].foo, 'buzz');
                    done();
                });
        });

        it('Invalid non-unique update PUT', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection')
                .send({})
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    supertest(app)
                        .put('/test-generic-database-service/testCollection/' + res.body[0]._id)
                        .send({
                            foo: 'buzz'
                        })
                        .expect('Content-Type', /json/)
                        .expect(400, function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            assert(new RegExp('.*duplicate key error.*').test(res.body.error));
                            done();
                        });

                });
        });
    });

    describe('Remove Tests', function () {
        var app;

        before(function (done) {
            app = mscoDatabaseWorker(testConfiguration);
            clearCollection('testCollection', done);
        });

        after(function (done) {
            app.emit('shutdown');
            clearCollection('testCollection', done);
        });

        var _objectId;
        it('Valid creationary POST', function (done) {
            supertest(app)
                .post('/test-generic-database-service/testCollection/')
                .send({
                    foo: 'bar'
                })
                .expect(200, function (err, res) {
                    if (err) {
                        done(err);
                    }
                    _objectId = res.body[0]._id;

                    done();
                });
        });

        it('Invalid DELETE with nonexistant ID', function (done) {
            supertest(app)
                .delete('/test-generic-database-service/testCollection/012345678901234567890123')
                .expect('Content-Type', /json/)
                .expect(404, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    assert.equal(res.body.error, 'No existing documents match the criteria.');
                    done();
                });

        });

        it('Updated GET and object equality', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/' + _objectId)
                .expect('Content-Type', /json/)
                .expect(200, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    assert(res.body.length, 1);
                    assert('foo' in res.body[0]);
                    assert.equal(res.body[0].foo, 'bar');
                    done();
                });
        });

        it('Valid updating DELETE with ID', function (done) {
            supertest(app)
                .delete('/test-generic-database-service/testCollection/' + _objectId)
                .expect(204, done);
        });

        it('Test for updated object equality with specified URL', function (done) {
            supertest(app)
                .get('/test-generic-database-service/testCollection/' + _objectId)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect([], done);
        });
    });
});