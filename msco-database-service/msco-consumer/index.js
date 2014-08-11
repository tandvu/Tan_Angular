'use strict';

var async = require('async'),
    mongoose = require('mongoose'),
    Consumer = require('./model').Consumer,
    DatabaseAccess = require('./model').DatabaseAccess,
    Role = require('./model').Role;

var MscoConsumerManager = function () {
    this.setConnection = function (uri, options, callback) {
        mongoose.connect(uri, options, callback);
    };

    this.findConsumer = function (identifier, callback) {
        Consumer().findOne({
            identifier: identifier
        }, callback);
    };

    this.findRole = function (name, callback) {
        Role.findOne({
            name: name
        }, callback);
    };

    this.getConsumers = function (callback) {
        Consumer().find({}, function (err, consumers) {
            async.each(consumers, function (consumer, callback) {
                    consumer.getRoles(function (err, roles) {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, roles);
                    });
                },
                function (err) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, consumers);
                });
        });
    };

    this.getRoles = function (callback) {
        Role.find({}, function (err, roles) {
            async.each(roles, function (role, callback) {
                    role.getDatabaseAccess(function (err, databases) {
                        if (err) {
                            return callback(err);
                        }

                        callback(null, databases);
                    });
                },
                function (err) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, roles);
                });
        });
    };
};

var manager = new MscoConsumerManager();

module.exports.Consumer = Consumer;
module.exports.DatabaseAccess = DatabaseAccess;
module.exports.Role = Role;

module.exports.setConnection = manager.setConnection;
module.exports.findConsumer = manager.findConsumer;
module.exports.findRole = manager.findRole;
module.exports.getConsumers = manager.getConsumers;
module.exports.getRoles = manager.getRoles;