'use strict';

var passport = require('passport'),
    util = require('util');

function Strategy(options) {

    if (typeof options === 'undefined') {
        options = {};
    }

    this.name = 'dev';
    passport.Strategy.call(this);

    this._identityHeader = options.identityHeader || 'X-Auth-Identity';

    this._accessRequirements = typeof options.accessRequirements !== 'undefined' ? options.accessRequirements : {
        'GET': ['manage', 'read'],
        'POST': ['manage'],
        'PUT': ['manage'],
        'DELETE': ['manage']
    };
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function (req) {
    var identity;
    var databaseName = req.params.databaseName;

    if (req.headers) {
        identity = req.get(this._identityHeader);
    }

    if (!identity) {
        return this.fail(new Error('Missing identity parameter'));
    } else if (!databaseName) {
        return this.fail(new Error('Missing databaseName parameter'));
    }

    if (this._accessRequirements[req.method].indexOf(identity) > -1) {
        return this.success({});
    }

    return this.fail(new Error('Access to database not authorized'));
};

module.exports.Strategy = Strategy;