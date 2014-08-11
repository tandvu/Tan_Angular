// Required modules
var exerciseCfg = require('./exerciseConfig');
var virtualLansCfg = require('./virtualLansConfig');

var initRoutes = function(app) {
    initExerciseConfigRoutes(app);
}

var initExerciseConfigRoutes = function(app) {
	
    // GET METHODS=================================
    // Exercise API
    app.get('/ecs/Exercises', exerciseCfg.getExercises );
    app.get('/ecs/Exercises/:id', exerciseCfg.getExercise );
	
    // VM Lan API
    app.get('/ecs/VirtualLanConfigurations', virtualLansCfg.getVirtualLanConfigurations );
    app.get('/ecs/VirtualLanConfigurations/:id', virtualLansCfg.getVirtualLanConfiguration ); 
    // ============================================

    // POST METHODS=================================
    app.post('/ecs/Exercises', exerciseCfg.postExercise );  
    app.post('/ecs/VirtualLanConfigurations', virtualLansCfg.postVirtualLanConfiguration );	
    // =============================================

    // PUT	METHODS=================================
    app.put('/ecs/Exercises/:id', exerciseCfg.putExercise );	
    app.put('/ecs/VirtualLanConfigurations/:id', virtualLansCfg.putVirtualLanConfiguration );
    // =============================================

    // DELETE	METHODS=================================
    app.delete('/ecs/Exercises/:id', exerciseCfg.deleteExercise );	
    app.delete('/ecs/VirtualLanConfigurations/:id', virtualLansCfg.deleteVirtualLanConfiguration );
    // =============================================
}

//
// Exported modules 
module.exports.initRoutes = initRoutes;