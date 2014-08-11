#!/usr/bin/env node

'use strict';

var async = require('async'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    prompt = require('prompt'),
    util = require('util'),
    AdminUser = require('./models/admin');

// read and parse command line configuration information.
var configuration = require('./config/parse');

async.waterfall([

    function (callback) {
        // initialize mongoose connection
        mongoose.connect(util.format('mongodb://%s:%d/generic-database-admin', configuration.mongodbHost, configuration.mongodbPort), configuration.mongodbOptions);

        mongoose.connection.on('connected', function () {
            callback(null);
        });

        mongoose.connection.on('error', callback);
    },
    function (callback) {
        // prompt the user for login information
        prompt.start();

        prompt.get([{
            name: 'username',
            type: 'string',
            description: 'Enter new admin username',
            pattern: /^[a-zA-Z0-9]+$/,
            message: 'Name must be only letters and numbers.',
            required: true
        }, {
            name: 'password',
            type: 'string',
            description: 'Enter new password',
            required: true,
            hidden: true,
            message: 'Passwords must be at least 6 characters long.',
            conform: function (value) {
                return (value.length > 5);
            }
        }, {
            name: 'confirm_password',
            type: 'string',
            description: 'Reenter new password',
            required: true,
            hidden: true,
            message: 'Passwords do not match.',
            conform: function (value) {
                return (value === prompt.history('password').value);
            }
        }], callback);
    },
    function (result, callback) {
        // create a user salt and derive a login hash for the user from the password provided
        var userSalt = crypto.randomBytes(64).toString('hex');

        var hashOptions = configuration.securityOptions && configuration.securityOptions.user ? configuration.securityOptions.user : {
            salt: '',
            iterations: 100000,
            keylength: 64
        };

        AdminUser.hashPassword(result.password, userSalt, hashOptions, function (err, derivedKey) {
            callback(err, result.username, derivedKey, userSalt);
        });
    },
    function (username, derivedKey, userSalt, callback) {
        // persist the new user
        new AdminUser({
            login: username,
            password: derivedKey,
            salt: userSalt
        })
            .save(callback);
    }
], function (err) {
    mongoose.disconnect();

    if (err) {
        console.log('Unexpected error.');
    }
});