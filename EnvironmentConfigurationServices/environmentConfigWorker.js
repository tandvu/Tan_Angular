
var express 		= require('express'),
    ecs 			= require('./config/initialization'),
    fve 			= require('./FVEServices/config/initialization'),
    vcs 			= require('./VirtualConfigurationServices/config/initialization'),
    logging			= require('./LoggingServices/config/initialization');


function initializeWorker(configuration) {

    var app = express();

    //Initialize Sub
    ecs.initialize(app, configuration);
    vcs.initialize(app);
    fve.initialize(app);
    logging.initialize(app);

    app.listen(configuration.port);

    console.log('Listening on port: ' + configuration.port + '\n');
}

module.exports = initializeWorker;