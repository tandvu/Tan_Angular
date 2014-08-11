'use strict';

var bodyParser = require('body-parser'),
    express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    path = require('path'),
    session = require('express-session'),
    util = require('util'),
    LocalStrategy = require('passport-local').Strategy,
    AdminUser = require('./models/admin');

var MscoConsumer = require('msco-consumer');

// read and parse command line configuration information.
var configuration = require('./config/parse');

mongoose.connect(util.format('mongodb://%s:%d/generic-database-admin', configuration.mongodbHost, configuration.mongodbPort), configuration.mongodbOptions);
MscoConsumer.setConnection(util.format('mongodb://%s:%d/%s', configuration.mongodbHost, configuration.mongodbPort, configuration.mongodbOptions.authDatabase || 'msco-consumer'));

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: configuration.securityOptions && configuration.securityOptions.session && configuration.securityOptions.session.secret ? configuration.securityOptions.session.secret : 'secret',
    resave: true,
    saveUninitialized: true
}));

// Configure Passport
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'userLogin',
        passwordField: 'userPassword'
    },

    function (req, login, password, done) {
        AdminUser.findOne({
            login: login
        }, function (err, user) {
            if (err || user === null) {
                return done(null, false, {
                    message: 'Invalid login or password.'
                });
            }

            var hashOptions = configuration.securityOptions && configuration.securityOptions.user ? configuration.securityOptions.user : {
                salt: '',
                iterations: 100000,
                keylength: 64
            };

            user.verifyPassword(password, hashOptions, function (err, verified) {
                if (err) {
                    return done(null, false, {
                        message: 'Invalid login or password.'
                    });
                }

                if (!verified) {
                    return done(null, false, {
                        message: 'Invalid login or password.'
                    });
                }

                return done(null, {
                    username: user.login
                });
            });
        });
    }
));

app.use(passport.initialize());
app.use(passport.session());

// remove extraneous headers
app.disable('x-powered-by');

// if development environment is activated enable development request logging
if (configuration.isDevelopment) {
    app.use(morgan('dev'));
}

// detect and build all routes from the files in the 'routes' directory
fs.readdirSync('./routes').forEach(function (file) {
    if (path.extname(file) === '.js') {
        app.use('/', require(path.resolve('./routes', file))(configuration));
    }
});

// create application server
var server = app.listen(configuration.port, function () {
    console.info('MSCO generic database administration interface started on port %d.', server.address().port);
});