'use strict';

var express = require('express'),
    passport = require('passport');

module.exports = (function () {

    function requireLogin(req, res, next) {
        if (req.session.passport.user) {
            next();
        } else {
            res.redirect('/');
        }
    }

    //-- Constructor
    return function () {

        var _route = express.Router();

        _route.get('/', function (req, res) {
            res.render('index');
        });

        _route.post('/login', passport.authenticate('local'), function (req, res) {
            res.send(200);
        });

        _route.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/');
        });

        _route.get('/dashboard', requireLogin, function (req, res) {
            res.render('dashboard');
        });

        return _route;
    };
})();