// Required modules
var exerciseVirtualSystems = require('./exerciseVirtualSystems');
var templates = require('./templates');
var virtualMachine = require('./virtualMachine');
var virtualEntity = require('./virtualEntity');

var initRoutes = function(app) {
	initVirtualServicesConfigRoutes(app);
}

var initVirtualServicesConfigRoutes = function(app) {

    // GET METHODS=================================
    // VCS Mongo Database API
	app.get('/ecs/vcs/ExerciseVirtualSystems/:exercise', exerciseVirtualSystems.getExerciseVirtualSystems );
    app.get('/ecs/vcs/ExerciseVirtualSystems/:exercise/:id', exerciseVirtualSystems.getExerciseVirtualSystem );
	app.get('/ecs/vcs/TemplateStatus/:exercise', virtualMachine.getTemplateStatuses );
    app.get('/ecs/vcs/TemplateStatus/:exercise/:id', virtualMachine.getTemplateStatus );

    // Virtualization Pass-thru API
    app.get('/ecs/vcs/vmTemplates', templates.getVmTemplates );
    app.get('/ecs/vcs/virtualMachines/:uid', virtualMachine.getVirtualMachine );
    app.get('/ecs/vcs/virtualEntity/:exercise', virtualEntity.getVirtualEntity );

    // Server Sent Event routes
    app.get('/ecs/vcs/createVirtualEntity/:exercise/:id', virtualEntity.createVirtualEntity );
    app.get('/ecs/vcs/deleteVirtualEntity/:exercise', virtualEntity.deleteVirtualEntity );
    app.get('/ecs/vcs/provisionVm/:exercise/:id', virtualMachine.getProvisionVm );
    app.get('/ecs/vcs/saveVmAsTemplate/:exercise/:uid/:newTemplateName', virtualMachine.getSaveVmAsTemplate );


    // POST METHODS=================================
    // VCS Mongo Database API
	app.post('/ecs/vcs/ExerciseVirtualSystems/:exercise', exerciseVirtualSystems.postExerciseVirtualSystem );
	app.post('/ecs/vcs/TemplateStatus/:exercise', virtualMachine.postTemplateStatus );


    // PUT METHODS=================================
    // VCS Mongo Database API
    app.put('/ecs/vcs/ExerciseVirtualSystems/:exercise/:id', exerciseVirtualSystems.putExerciseVirtualSystem );
    app.put('/ecs/vcs/TemplateStatus/:exercise/:id', virtualMachine.putTemplateStatus );


    // Virtualization Pass-thru API
    app.put('/ecs/vcs/startVm/:uid', virtualMachine.putStartVm );
    app.put('/ecs/vcs/stopVm/:uid', virtualMachine.putStopVm );
    app.put('/ecs/vcs/suspendVm/:uid', virtualMachine.putSuspendVm );


    // DELETE METHODS=================================
    // VCS Mongo Database API
    app.delete('/ecs/vcs/ExerciseVirtualSystems/:exercise/:id', exerciseVirtualSystems.deleteExerciseVirtualSystem );
    app.delete('/ecs/vcs/TemplateStatus/:exercise/:id', virtualMachine.deleteTemplateStatus );
}


//
// Exported modules 
module.exports.initRoutes = initRoutes;