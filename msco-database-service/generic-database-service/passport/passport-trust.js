'use strict';

var passport = require('passport'),
    util = require('util');

function Strategy() {
    passport.Strategy.call(this);

    this.name = 'trust';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function () {
    this.success({}, {});
};

module.exports.Strategy = Strategy;