'use strict';

var async = require('async'),
    express = require('express'),
    moment = require('moment'),
    passport = require('passport'),
    util = require('util'),
    Db = require('mongodb').Db,
    ObjectID = require('mongodb').ObjectID,
    Server = require('mongodb').Server;

require('simple-errors');

// Mongo connection pooling functionality
var MongoConnectionPool = (function () {

    //-- Private Attributes
    var _connectionPool = {};

    //-- Constructor
    return function (mongoConfiguration) {

        /**
         * Get the connection from the pool for the specified consumer.
         * If the connection does not exist the connection will be created and returned.
         *
         * @param consumerHash {String} Computed hash of the consumer
         * @param databaseName {String} MongoDB database name to perform the operation on
         * @param callback     {Function} Callback to execute on completion of operation
         * @api public
         */
        this.getConnection = function (consumerHash, databaseName, callback) {
            if (!mongoConfiguration) {
                return callback(new Error('Invalid database configuration.'));
            }

            // Only return the connection from the pool if the connection exists and the connection is currently in the connected state
            if ((consumerHash in _connectionPool) && _connectionPool[consumerHash]._state === 'connected') {
                callback(null, _connectionPool[consumerHash]);
            } else {
                new Db(databaseName, new Server(mongoConfiguration.mongodbHost, mongoConfiguration.mongodbPort), mongoConfiguration.mongodbOptions).open(function (err, db) {
                    if (err) {
                        return callback(err);
                    }

                    if (mongoConfiguration.mongodbCredentials && mongoConfiguration.mongodbCredentials.username && mongoConfiguration.mongodbCredentials.password) {
                        db.authenticate(mongoConfiguration.mongodbCredentials.username, mongoConfiguration.mongodbCredentials.password, function (err, result) {
                            if (err || !!result) {
                                return callback(new Error('Unexpected database authentication error.'));
                            }

                            callback(null, db);
                        });
                    }
                    else {
                        _connectionPool[consumerHash] = db;
                        callback(null, db);
                    }
                });

            }
        };

        /**
         * Remove the connection from the pool for the specified consumer.
         *
         * @param consumerHash {String} Computed hash of the consumer
         * @param callback     {Function} Callback to execute on completion of operation
         * @api public
         */
        this.removeConnection = function (consumerHash, callback) {
            if (consumerHash in _connectionPool) {
                _connectionPool[consumerHash].close(function (err, result) {
                    if (err || !!result) {
                        return callback(new Error('Unexpected database close error.'));
                    }

                    callback(null);
                });
            }
            else {
                callback(null);
            }
        };

        /**
         * Destroy all applicable objects pertaining to this object's instantiation and operation.
         *
         * @param callback {Function} Callback to execute on completion of operation
         * @api public
         */
        this.destroy = function (callback) {
            async.each(_connectionPool, function (connection, callback) {
                connection.close(true, callback);
            }, callback);
        };
    };
})();

var RouteManager = (function () {

    //-- Private Attributes
    var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss Z';

    var _connectionPool;
    var _router;

    /**
     * Remove document or documents which match the supplied query criteria
     *
     * @param databaseName {String} MongoDB database name to perform the operation on
     * @param collectionName {String} MongoDB collection name to perform the operation upon
     * @param criteria {Map} Mapped properties to determine which documents to remove
     * @param callback {Function} Callback to execute on completion of database operation
     * @api private
     */
    function _openCollection(databaseName, collectionName, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        /*
         * TODO: Utilize incoming values to properly construct a valid hash.
         * NOTE: Hash must be based on consumer and database accessed as consumers may be assigned
         *       different permission per database.
         */
        var consumerHash = options.consumerHash ? options.consumerHash : util.format('%s|%s', 'msco', databaseName);

        async.waterfall([

            function (callback) {
                _connectionPool.getConnection(consumerHash, databaseName, callback);
            },
            function (db, callback) {
                db.collection(collectionName, {
                    strict: true
                }, function (err, collection) {
                    if (err && options.create) {
                        db.createCollection(collectionName, function (err, collection) {
                            callback(err, db, collection, true);
                        });
                    } else if (err) {
                        callback(Error.http(404, util.format('Collection %s does not exist in database %s.', collectionName, databaseName)));
                    } else {
                        callback(err, db, collection, false);
                    }
                });
            }
        ], callback);
    }

    /**
     * Find a document or documents which match the supplied query criteria
     *
     * @param databaseName {String} MongoDB database name to perform the operation on
     * @param collectionName {String} MongoDB collection name to perform the operation upon
     * @param criteria {Map} Mapped properties to determine which documents to query
     * @param callback {Function} Callback to execute on completion of database operation
     * @api private
     */
    function _findDocuments(databaseName, collectionName, criteria, callback) {
        async.waterfall([

            function (callback) {
                _openCollection(databaseName, collectionName, {
                    create: false
                }, callback);
            },
            function (database, collection, created, callback) {
                collection.find(criteria).toArray(callback);
            }
        ], callback);
    }

    /**
     * Insert a document as described by the supplied information
     *
     * @param databaseName {String} MongoDB database name to perform the operation on
     * @param collectionName {String} MongoDB collection name to perform the operation upon
     * @param document {Map} Object describing the document to create
     * @param uniqueKey {String} Field name which should be unique in the collection
     * @param callback {Function} Callback to execute on completion of database operation
     * @api private
     */
    function _insertDocument(databaseName, collectionName, document, uniqueKey, callback) {
        async.waterfall([
            
            function (callback) {
                if (Array.isArray(document)) {
                    if (document.some(function (doc) { return '_id' in doc; })) {
                        callback(new Error('Invalid document creation. Do not specify _id parameter.'));
                    }
                } else {
                    if ('_id' in document) {
                        callback(new Error('Invalid document creation. Do not specify _id parameter.'));
                    }
                }

                callback(null);
            },
            function (callback) {
                _openCollection(databaseName, collectionName, {
                    create: true
                }, callback);
            },
            function (database, collection, created, callback) {
                // if no uniqueKey is specified then short circuit the index creation step
                if (!uniqueKey) {
                    return callback(null, database, collection);
                }

                collection.indexInformation({
                    full: true
                }, function (err, indexes) {
                    if (err) {
                        return callback(err);
                    }

                    // first check to see if there exists an index on the specified unique field
                    var indexExists = indexes.some(function (index) {
                        return (uniqueKey in index.key && index.key[uniqueKey] === 1 && index.unique);
                    });

                    // ... if it already does then just skip to the next logical step
                    if (indexExists) {
                        callback(err, database, collection);
                    }
                    // ... otherwise if the collection was just created then create the requested index
                    else if (created) {
                        var spec = {};
                        spec[uniqueKey] = 1;

                        collection.ensureIndex(spec, {
                            unique: true,
                            sparse: true
                        }, function (err) {
                            callback(err, database, collection);
                        });
                    }
                    // ... otherwise this is an attempt to create a new unique field on an existing collection which is invalid
                    else {
                        callback(new Error('Can not create additional unique field on existing collection.'));
                    }
                });
            },
            function (database, collection, callback) {
                collection.insert(document, callback);
            }
        ], callback);
    }

    /**
     * Update a document as described by the supplied information
     *
     * @param databaseName {String} MongoDB database name to perform the operation on
     * @param collectionName {String} MongoDB collection name to perform the operation upon
     * @param criteria {Map} Mapped properties to determine which documents to update
     * @param document {Map} Object describing the document to create
     * @param callback {Function} Callback to execute on completion of database operation
     * @api private
     */
    function _updateDocument(databaseName, collectionName, criteria, document, callback) {
        async.waterfall([

            function (callback) {
                _openCollection(databaseName, collectionName, {
                    create: false
                }, callback);
            },
            function (database, collection, created, callback) {

                collection.find(criteria).toArray(function (err, results) {
                    if (results.length === 0) {
                        callback(Error.http(404, 'No existing documents match the criteria.'));
                    } else {
                        callback(err, database, collection);
                    }
                });
            },
            function (database, collection, callback) {
                collection.update(criteria, document, callback);
            }
        ], callback);
    }

    /**
     * Remove a document or documents which match the supplied query criteria
     *
     * @param databaseName {String} MongoDB database name to perform the operation on
     * @param collectionName {String} MongoDB collection name to perform the operation upon
     * @param criteria {Map} Mapped properties to determine which documents to remove
     * @param callback {Function} Callback to execute on completion of database operation
     * @api private
     */
    function _removeDocument(databaseName, collectionName, criteria, callback) {
        async.waterfall([

            function (callback) {
                _openCollection(databaseName, collectionName, callback);
            },
            function (database, collection, created, callback) {
                collection.find(criteria).toArray(function (err, results) {
                    if (results.length === 0) {
                        callback(Error.http(404, 'No existing documents match the criteria.'));
                    } else {
                        callback(err, database, collection);
                    }
                });
            },
            function (database, collection, callback) {
                collection.remove(criteria, callback);
            }
        ], callback);
    }

    /**
     * Sanitize incoming HTTP Query String parameters to logical values.
     * Specifically converts incoming values acording to the following conversion rules:
     *
     *  Integer Values (String with any values 0-9) -> Integer
     *  Float Values (String with any values 0-9 plus a single .) -> Float
     *  Case Insensetive "TRUE" -> true
     *  Case Insensetive "FALSE" -> false
     *
     * @param queryParameters {Map} Mapped properties to determine which documents to query
     * @api private
     */
    function _sanitizeQueryString(queryParameters) {
        for (var key in queryParameters) {

            if (typeof queryParameters[key] === 'string') {
                if (/^[0-9]+$/.test(queryParameters[key])) {
                    queryParameters[key] = parseInt(queryParameters[key], 10);
                }
                else if (/^[0-9]*[.][0-9]+$/.test(queryParameters[key])) {
                    queryParameters[key] = parseFloat(queryParameters[key], 10);
                }
                else if (/^true$/i.test(queryParameters[key])) {
                    queryParameters[key] = true;
                }
                else if (/^false$/i.test(queryParameters[key])) {
                    queryParameters[key] = false;
                }
            }
        }

        return queryParameters;
    }

    //-- Constructor
    return function (configuration) {
        // Create MongoDB connection pool based on provided data
        _connectionPool = new MongoConnectionPool(configuration);

        // Allocate Express router object
        _router = express.Router();

        /** Catch all development route to log relevant information to the console */
        if (configuration.isDevelopment) {
            _router.use('/:databaseName/:collectionName/:documentId?', function (req, res, next) {
                console.info('URL (%s) Database Name (%s) Collection Name (%s) Document ID (%s)', req.baseUrl, req.params.databaseName, req.params.collectionName, req.params.documentId ? req.params.documentId : '');
                next();
            });
        }

        /** GET method implementation */
        _router.get('/:databaseName/:collectionName/:documentId([0-9a-f]{24})?', passport.authenticate(configuration.passportStrategy.name, {
            session: false
        }), function (req, res) {
            var queryCriteria = typeof(req.params.documentId) === 'undefined' ? (typeof(req.query) === 'undefined' ? {} : req.query) : {
                _id: req.params.documentId
            };

            if ('_id' in queryCriteria) {
                queryCriteria._id = ObjectID.createFromHexString(queryCriteria._id);
            }

            queryCriteria = _sanitizeQueryString(queryCriteria);

            _findDocuments(req.params.databaseName, req.params.collectionName, queryCriteria, function (err, results) {
                if (err) {
                    if (configuration.isDevelopment) {
                        console.error(err);
                    }

                    res.json(err.status || 400, {
                        error: err.message
                    });
                } else {
                    res.json(200, results);
                }
            });
        });

        /** POST method implementation */
        _router.post('/:databaseName/:collectionName/:uniqueKey?', passport.authenticate(configuration.passportStrategy.name, {
            session: false
        }), function (req, res) {

            var newDocument = req.body;
            if (Array.isArray(req.body)) {
                newDocument = req.body.map(function (value) {
                    value.time = moment().utc().format(DATE_FORMAT);
                    return value;
                });
            } else {
                newDocument.time = moment().utc().format(DATE_FORMAT);
            }

            _insertDocument(req.params.databaseName, req.params.collectionName, newDocument, req.params.uniqueKey, function (err, docs) {
                if (err) {
                    if (configuration.isDevelopment) {
                        console.error(err);
                    }

                    res.json(err.status || 400, {
                        error: err.message
                    });
                } else {
                    res.json(200, docs);
                }
            });
        });

        /** PUT method implementation */
        _router.put('/:databaseName/:collectionName/:documentId([0-9a-f]{24})', passport.authenticate(configuration.passportStrategy.name, {
            session: false
        }), function (req, res) {

            var newDocument = req.body;
            newDocument.time = moment().utc().format(DATE_FORMAT);

            // Validate and provided document _id attribute matched requested document ID
            if ('_id' in newDocument && newDocument._id !== req.params.documentId) {
                return res.json(400, { error: 'Mismatch between document _id attribute and requested document ID.'});
            }

            _updateDocument(req.params.databaseName, req.params.collectionName, {
                _id: new ObjectID.createFromHexString(req.params.documentId)
            }, newDocument, function (err) {
                if (err) {
                    if (configuration.isDevelopment) {
                        console.error(err);
                    }

                    res.json(err.status || 400, {
                        error: err.message
                    });
                } else {

                    _findDocuments(req.params.databaseName, req.params.collectionName, { _id: ObjectID.createFromHexString(req.params.documentId) }, function (err, results) {
                        if (err) {
                            if (configuration.isDevelopment) {
                                console.error(err);
                            }

                            res.json(err.status || 400, {
                                error: err.message
                            });
                        } else {
                            res.json(200, results[0]);
                        }
                    });
                }
            });
        });

        /** DELETE method implementation */
        _router.delete('/:databaseName/:collectionName/:documentId([0-9a-f]{24})', passport.authenticate(configuration.passportStrategy.name, {
            session: false
        }), function (req, res) {

            _removeDocument(req.params.databaseName, req.params.collectionName, {
                _id: new ObjectID.createFromHexString(req.params.documentId)
            }, function (err) {
                if (err) {
                    if (configuration.isDevelopment) {
                        console.error(err);
                    }

                    res.json(err.status || 400, {
                        error: err.message
                    });
                } else {
                    // HTTP 204 sent instead of 200 since there is no message body
                    res.send(204);
                }
            });
        });

        /**
         * Getter for the private _router property.
         *
         * @api public
         */
        this.getRouter = function () {
            return _router;
        };

        /**
         * Destroy all applicable objects pertaining to this object's instantiation and operation.
         *
         * @param callback {Function} Callback to execute on completion of operation
         * @api public
         */
        this.destroy = function (callback) {
            _connectionPool.destroy(callback);
        };
    };
})();

module.exports = RouteManager;