'use strict';

var crypto = require('crypto'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AdminUser = new Schema({
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        size: 128,
        required: true
    },
    salt: {
        type: String,
        size: 128,
        required: true
    }
});

AdminUser.statics.hashPassword = function (password, salt, configuration, callback) {
    if (typeof configuration === 'function') {
        callback = configuration;
        configuration = undefined;
    }

    if (!configuration) {
        configuration = {
            salt: '',
            iterations: 100000,
            keylength: 64
        };
    }

    salt = typeof salt === 'object' ? salt.toString('hex') : salt;

    crypto.pbkdf2(password, salt + configuration.salt, configuration.iterations, configuration.keylength, function (err, derivedKey) {
        if (err) { return callback(err); }

        callback(err, derivedKey.toString('hex'));
    });
};

AdminUser.methods.verifyPassword = function (password, configuration, callback) {
    if (typeof configuration === 'function') {
        callback = configuration;
        configuration = undefined;
    }

    var context = this;

    this.constructor.hashPassword(password, this.salt, configuration, function (err, derivedKey) {
        if (err) { return callback(err); }

        callback(err, derivedKey === context.password);
    });
};

module.exports = mongoose.model('AdminUser', AdminUser);