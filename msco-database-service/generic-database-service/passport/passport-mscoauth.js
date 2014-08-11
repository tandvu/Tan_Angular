'use strict';

var MscoConsumer = require('msco-consumer'),
    passport = require('passport'),
    util = require('util');

function Strategy(options, configuration) {

    if (typeof options === 'undefined') {
        options = {};
    }

    MscoConsumer.setConnection(util.format('mongodb://%s:%d/%s', configuration.mongodbHost, configuration.mongodbPort, options.authDatabase || 'msco-consumer'));

    passport.Strategy.call(this);

    this.name = 'mscoauth';
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

    var self = this;

    MscoConsumer.findConsumer(identity, function (err, consumer) {
        if (err) {
            return self.error(err);
        }

        if (!consumer) {
            return self.fail(new Error('Consumer not located'));
        }

        consumer.getDatabaseAccess(databaseName, function (err, databaseAccesses) {
            if (err) {
                return self.error(err);
            }

            for (var i = 0; i < databaseAccesses.length; i++) {
                if (self._accessRequirements[req.method].indexOf(databaseAccesses[i].access) > -1) {
                    return self.success(consumer);
                }
            }

            return self.fail(new Error('Access to database not authorized'));
        });

    });
};


module.exports.Strategy = Strategy;