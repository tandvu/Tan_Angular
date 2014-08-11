'use strict';

var bodyParser      = require('body-parser'),
    express         = require('express'),
    fs              = require('fs'),
    morgan          = require('morgan'),
    passport        = require('passport'),
    path            = require('path');

function initializeWorker(configuration) {
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    // remove extraneous headers
    app.disable('x-powered-by');

    // if development environment is activated enable development request logging
    if (configuration.isDevelopment) {
        app.use(morgan('dev'));
    }

    // initialize PassportJS-based request authentication
    app.use(passport.initialize());
    passport.use(configuration.passportStrategy);

    // detect and build all routes from the files in the 'routes' directory
    fs.readdirSync('./routes').forEach(function (file) {
        if (path.extname(file) === '.js') {
            var RouteManager = require(path.resolve('./routes', file));
            var routeManager = new RouteManager(configuration);

            app.use('/', routeManager.getRouter());

            // expose shutdown event to force destroy route and associated objects
            app.on('shutdown', function () {
                routeManager.destroy(function () {
                    console.info('MSCO generic database service interface has shut down.');
                });
            });
        }
    });

    var server = app.listen(configuration.port, function () {
        console.info('MSCO generic database service interface started on port %d.', server.address().port);
    });

    return app;
}

module.exports = initializeWorker;