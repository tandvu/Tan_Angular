// Required modules
var fveProcessCfg = require('./fveProcessConfig');
var fveMissionCfg = require('./fveExerciseConfig');

var initRoutes = function(app) {
	initVirtualServicesConfigRoutes(app);
}

var initVirtualServicesConfigRoutes = function(app) {

    app.get('/ecs/fve/Enums/:enumId', fveMissionCfg.getEnumList);   
    app.get('/ecs/fve/Enums', fveMissionCfg.getEnumList);   

    // GET METHODS=================================
    app.get('/ecs/fve/Missions/:exercise', fveMissionCfg.getExerciseDocument );  
    app.get('/ecs/fve/Missions/:exercise/:missionId', fveMissionCfg.getExerciseDocument );  
    app.get('/ecs/fve/Mets/:exercise', fveMissionCfg.getExerciseDocument );  
    app.get('/ecs/fve/Mets/:exercise/:metsId', fveMissionCfg.getExerciseDocument );  
    app.get('/ecs/fve/MissionProducts/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/MissionProducts/:exercise/:missionProductId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/MissionMetrics/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/MissionMetrics/:exercise/:missionMetricId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/RoleAssignments/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/RoleAssignments/:exercise/:roleAssignmentId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/Users/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/Users/:exercise/:userId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/ProcessInstances/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/ProcessInstances/:exercise/:processInstanceId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceRoles/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceRoles/:exercise/:instanceRoleId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceTasks/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceTasks/:exercise/:instanceTaskId', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceVariables/:exercise', fveMissionCfg.getExerciseDocument );   
    app.get('/ecs/fve/InstanceVariables/:exercise/:instanceVariableId', fveMissionCfg.getExerciseDocument );   

    //Process API
    app.get('/ecs/fve/DeploymentSummaries', fveProcessCfg.getDeploymentSummaries );
    app.get('/ecs/fve/Processes', fveProcessCfg.getDeployedProcesses );
    app.get('/ecs/fve/Processes/:deploymentId', fveProcessCfg.getDeployedProcess );
    app.get('/ecs/fve/ProcessSummary/:deploymentId/:processId', fveProcessCfg.getProcessSummary );
    app.get('/ecs/fve/SwimlaneRoles/:exercise', fveProcessCfg.getSwimlaneRoles );
    app.get('/ecs/fve/SwimlaneRoles/:exercise/:missionId', fveProcessCfg.getSwimlaneRoles );
    app.get('/ecs/fve/MissionTasks/:exercise/:missionId', fveProcessCfg.getMissionTasks );
    app.get('/ecs/fve/UnstartedTasks/:exercise/:missionId', fveProcessCfg.getUnstartedTasks );
    app.get('/ecs/fve/TaskForm/:exercise/:instanceTaskId', fveProcessCfg.getTaskForm );
    app.post('/ecs/fve/StartMission/:exercise/:missionId', fveProcessCfg.startMission );
    app.post('/ecs/fve/StopMission/:exercise/:missionId', fveProcessCfg.stopMission );
    app.post('/ecs/fve/StartTask/:exercise/:missionId/:pesTaskId', fveProcessCfg.startTask );
    app.post('/ecs/fve/CompleteTask/:exercise/:instanceTaskId', fveProcessCfg.completeTask );
    // ============================================


    // POST METHODS=================================
    app.post('/ecs/fve/Missions/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/Mets/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/MissionProducts/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/MissionMetrics/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/RoleAssignments/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/Users/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/ProcessInstances/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/InstanceRoles/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/InstanceTasks/:exercise', fveMissionCfg.postExerciseDocument );  
    app.post('/ecs/fve/InstanceVariables/:exercise', fveMissionCfg.postExerciseDocument );  
    // ============================================

    // PUT METHODS=================================
    app.put('/ecs/fve/Missions/:exercise/:missionId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/Mets/:exercise/:metId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/MissionProducts/:exercise/:missionProductId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/MissionMetrics/:exercise/:missionMetricId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/RoleAssignments/:exercise/:roleAssignmentId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/Users/:exercise/:userId', fveMissionCfg.putExerciseDocument );  
    app.put('/ecs/fve/ProcessInstances/:exercise/:processInstanceId', fveMissionCfg.putExerciseDocument );   
    app.put('/ecs/fve/InstanceRoles/:exercise/:instanceRoleId', fveMissionCfg.putExerciseDocument );   
    app.put('/ecs/fve/InstanceTasks/:exercise/:instanceTaskId', fveMissionCfg.putExerciseDocument );   
    app.put('/ecs/fve/InstanceVariables/:exercise/:instanceVariableId', fveMissionCfg.putExerciseDocument );   
    // ============================================

    // DELETE METHODS=================================
    app.delete('/ecs/fve/Missions/:exercise/:missionId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/Mets/:exercise/:metId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/MissionProducts/:exercise/:missionProductId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/MissionMetrics/:exercise/:missionMetricId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/RoleAssignments/:exercise/:roleAssignmentId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/Users/:exercise/:userId', fveMissionCfg.deleteExerciseDocument );  
    app.delete('/ecs/fve/ProcessInstances/:exercise/:processInstanceId', fveMissionCfg.deleteExerciseDocument );   
    app.delete('/ecs/fve/InstanceRoles/:exercise/:instanceRoleId', fveMissionCfg.deleteExerciseDocument );   
    app.delete('/ecs/fve/InstanceTasks/:exercise/:instanceTaskId', fveMissionCfg.deleteExerciseDocument );   
    app.delete('/ecs/fve/InstanceVariables/:exercise/:instanceVariableId', fveMissionCfg.deleteExerciseDocument );   
    // ============================================

}

//
// Exported modules 
module.exports.initRoutes = initRoutes;