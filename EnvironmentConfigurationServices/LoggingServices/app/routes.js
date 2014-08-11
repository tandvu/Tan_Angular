// Required modules
var dataProductsLoggingConfig = require('./dataProductsLoggingConfig');
var processLoggingConfig = require('./processLoggingConfig');
var errorLoggingConfig = require('./errorLoggingConfig');

var initRoutes = function(app) {
    initLoggingRoutes(app);
}

var initLoggingRoutes = function(app) {

    // GET METHODS=================================
    app.get('/ecs/Logging/DataProduct/:exerciseId', dataProductsLoggingConfig.getDataProductLogEntriesForExercise);
    app.get('/ecs/Logging/DataProduct/:exerciseId/:processInstanceId', dataProductsLoggingConfig.getDataProductLogEntriesForMission);
    app.get('/ecs/Logging/Process/:exerciseId', processLoggingConfig.getProcessLogEntriesForExercise);
    app.get('/ecs/Logging/Process/:exerciseId/:processInstanceId', processLoggingConfig.getProcessLogEntriesForMission);
	app.get('/ecs/Logging/Error/:exerciseId', errorLoggingConfig.getErrorLogEntriesForExercise);
	
    // POST METHODS=================================
	app.post('/ecs/Logging/DataProduct/:exerciseId', dataProductsLoggingConfig.postDataProductLogEntry);
    app.post('/ecs/Logging/Process/:exerciseId', processLoggingConfig.postProcessLogEntry);
    app.post('/ecs/Logging/Error/:exerciseId', errorLoggingConfig.postErrorLogEntry);
}

//
// Exported modules 
module.exports.initRoutes = initRoutes;