var init 	= require('../../config/initialization');
var restify	= require('restify');
var async 	= require('async');
var url 	= require('url');
var util    = require('util');
var mongoose 	= require('mongoose');
var parseString = require('xml2js').parseString;
var fveExercise = require('./fveExerciseConfig');
var EncryptionManager = require('../../encryption/encryption-manager');

// Definition of JSON schema for the ExerciseMissions collection
var UnstartedTaskSchema = mongoose.Schema({
    name: {type: String, required: true},
    pesTaskId: {type: String, required: true},
    role: {type: String, required: true},
    owner: {type: String, required: true},
    status: {type: String, required: true},
    input: [ {
        name : {type: String, required: true},
        description : {type: String, required: false},
        url: {type: String, required: false}
    } ],
    output: [ {
        name : {type: String, required: true},
        description : {type: String, required: true},
        url: {type: String, required: false}
    } ]
});

var TaskSchema = mongoose.Schema({
    name: {type: String, required: true},
    role: {type: String, required: true},
    owner: {type: String, required: true},
    input: [ {
        name : {type: String, required: true},
        description : {type: String, required: false},
        url: {type: String, required: false}
    } ],
    output: [ {
        name : {type: String, required: true},
        description : {type: String, required: true},
        url: {type: String, required: false}
    } ]
});

var MissionTaskSchema = mongoose.Schema({
    name: {type: String, required: true},
    processId: {type: String, required: true},
    tasks: [ TaskSchema ],
    subProcesses: [ {
	    id: {type: String, required: true},
	    name: {type: String, required: true},
	    processId: {type: String, required: true},
	    role: {type: String, required: true},
	    tasks: [ TaskSchema ]
    } ]
});

var UnstartedTaskModel = mongoose.model('UnstartedTask', UnstartedTaskSchema);
var MissionTaskModel = mongoose.model('MissionTask', MissionTaskSchema);

function createClient(basicAuth) {
	var props = init.getJBPMServiceProps();

	var jBPMClient = restify.createJsonClient({
		url: util.format('%s://%s:%s', props.jBPMServiceProto, props.jBPMServiceAddr, props.jBPMServicePort)
	});

	if (basicAuth) {
		jBPMClient.basicAuth(
			props.jBPMUsername,
			props.privateKey ? new EncryptionManager({privateKey : props.privateKey}).decrypt(props.jBPMPassword) : props.jBPMPassword
		);
	}

	return jBPMClient;
}
// methods
var getDeploymentSummaries = function(request, response) {

	// Creates a JSON client
	var jBPMClient = createClient(true);

	var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/deployment/summaries';
	console.log('calling jbpm: ' + uri);
	jBPMClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log("An error ocurred:", err);
			response.json(500, err);
		} else {
			response.json(obj);
		}
		
	});
    
}

var getDeployedProcesses = function(request, response) {

	var jbpmServiceProperties = init.getJBPMServiceProps();

	// Creates a JSON client
	var jBPMClient = createClient(true);

	var uri = jbpmServiceProperties['jBPMServiceURI'] + '/rest/processDefinitions/topLevelProcesses';
	console.log('calling jbpm: ' + uri);
	jBPMClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log("An error ocurred:", err);
			response.json(500, err);
		} else {
			response.json(obj);
		}
	});
    
}

var getDeployedProcess = function(request, response) {

	// Creates a JSON client
	var jBPMClient = createClient(true);

	var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/deployment/' + request.params.deploymentId + '/processes';
	console.log('calling jbpm: ' + uri);
	jBPMClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log("An error ocurred:", err);
			response.json(500, err);
		} else {
			response.json(obj);
		}
	});
    
}

var getProcessSummary = function(request, response) {

	// Creates a JSON client
	var jBPMClient = createClient(true);

	var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/deployment/' + request.params.deploymentId + '/process/' + request.params.processId + '/summary';
	console.log('calling jbpm: ' + uri);
	jBPMClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log("An error ocurred:", err);
			response.json(500, err);
		} else {
			response.json(obj);
		}
	});
    
}

var _getBPMN2File = function(exercise, missionId, callback) {
	// Creates a JSON client
	var jBPMClient = createClient(true);

	async.waterfall([
		function(callback) {
			// must simulate the URL for parsing so localhost is fine
			var uri = 'http://localhost:80/ecs/fve/Missions/' + exercise; 
			if (missionId) {
				uri = uri + '/' + missionId;
			}
			var params = { 'missionId': missionId, 'exercise': exercise }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(missions, callback) {
			async.mapSeries(missions, function( mission, itemCallback ) {

				var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/processDefinitions/' + mission.processId;
				console.log('calling jbpm: ' + uri);
				jBPMClient.get(uri, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						itemCallback(err);
					} else if (!obj || !obj.hasOwnProperty('encodedProcessSource') ) {
                        itemCallback('No processes found for: ' + mission.processId);
                    } else {
				    	var buf = new Buffer(obj.encodedProcessSource, 'base64');
						itemCallback(null, buf);
					}
				});
		    	
			}, function(err, bpmnProcesses) {
			    if( err ) {
				    console.log('error in foreach mission loop', err);
				    callback(err);
			    } else {
			    	callback(null, bpmnProcesses);
			    }

			});
		}
	], callback);
}

var _getBPMNLanes = function(doc, doneCallback) {
	parseString(doc, function (err, result) {
		var bpmnDef = result['bpmn2:definitions'];
		var bpmnProcess = bpmnDef['bpmn2:process'];

		var swimlaneRoles = [];
		if (bpmnProcess[0].hasOwnProperty('bpmn2:laneSet') && 
				bpmnProcess[0]['bpmn2:laneSet'][0].hasOwnProperty('bpmn2:lane') ) {
		    for (var l in bpmnProcess[0]['bpmn2:laneSet'][0]['bpmn2:lane']) {
		    	var lane = bpmnProcess[0]['bpmn2:laneSet'][0]['bpmn2:lane'][l];
                if(swimlaneRoles.indexOf(lane['$'].name) == -1) {
                    swimlaneRoles.push(lane['$'].name);
                }
		    }
		}
	    doneCallback(null, swimlaneRoles);
	});               

}

var _getBPMNTasks = function(doc, doneCallback) {
	parseString(doc, function (err, result) {
		var bpmnDef = result['bpmn2:definitions'];
		var bpmnProcess = bpmnDef['bpmn2:process'][0];
		var bpsimElementParameters = bpmnDef['bpmn2:relationship'][0]['bpmn2:extensionElements'][0]['bpsim:BPSimData'][0]['bpsim:Scenario'][0]['bpsim:ElementParameters'];

		var taskMap = {
			name: bpmnProcess['$'].name,
			processId: bpmnProcess['$'].id
		};
		var tasks = [];
		var subProcesses = [];

	    for (var key in bpmnProcess) {
	    	if ( (key.indexOf('Task', key.length - 'Task'.length)) !== -1 || (key == 'bpmn2:task')) {
		    	for (var t in bpmnProcess[key]) {
		    		// create variable of BPMN Task from BPMN2 XML/JSON for easy access
		    		var bpmnTask = bpmnProcess[key][t];

		    		// create empty task
			    	var task = {};
			    	// set the name
			    	task.name = bpmnTask['$'].name;
			    	task.id = bpmnTask['$'].id;
                    task.type = key.substring(key.indexOf(':') + 1);

                    // get the description
                    if (bpmnTask.hasOwnProperty('bpmn2:documentation')) {
                        task.description = bpmnTask['bpmn2:documentation'][0]['_'];
                    }
			    	// get Input/Output as all that info is in ioSpecificaiton object
			    	for (var x in bpmnTask['bpmn2:ioSpecification']) {
			    		var element = bpmnTask['bpmn2:ioSpecification'][x];
			    		// get input
			    		var dataInputs = element['bpmn2:dataInput'];
			    		task.input = [];
			    		for (var i in dataInputs) {
                            var inputDef = {
                                name: dataInputs[i]['$'].name
                            };
				    		// inputs are used for other info as well so ignore those
				    		if (dataInputs[i]['$'].name != 'TaskName' && dataInputs[i]['$'].name != 'Comment') {
                                var taskID = dataInputs[i]['$'].id;
                                if (bpmnTask.hasOwnProperty('bpmn2:dataInputAssociation')) {
                                    var associations = bpmnTask['bpmn2:dataInputAssociation'];
                                    for (var a in associations) {
                                        if (taskID == associations[a]['bpmn2:targetRef'] &&
                                                associations[a]['bpmn2:assignment'] &&
                                                associations[a]['bpmn2:assignment'][0]['bpmn2:from'][0]) {
                                            inputDef.description = associations[a]['bpmn2:assignment'][0]['bpmn2:from'][0]['_'];
                                        }
                                    }
                                }
                                task.input.push(inputDef);
                            }
			    		}
			    		var dataOutputs = element['bpmn2:dataOutput'];
			    		task.output = [];
			    		for (var i in dataOutputs) {
                            var outputDef = {
                                name: dataOutputs[i]['$'].name
                            };
                            // outputs are used for other info as well so ignore those
                            if (dataOutputs[i]['$'].name != 'TaskName' && dataOutputs[i]['$'].name != 'Comment') {
                                var taskID = dataOutputs[i]['$'].id;
                                if (bpmnTask.hasOwnProperty('bpmn2:dataOutputAssociation')) {
                                    var associations = bpmnTask['bpmn2:dataOutputAssociation'];
                                    for (var a in associations) {
                                        if (taskID == associations[a]['bpmn2:targetRef'] &&
                                            associations[a]['bpmn2:assignment'] &&
                                            associations[a]['bpmn2:assignment'][0]['bpmn2:from'][0]) {
                                            outputDef.description = associations[a]['bpmn2:assignment'][0]['bpmn2:from'][0]['_'];
                                        }
                                    }
                                }
                                task.output.push(outputDef);
                            }
			    		}
			    	}
		    		// get duration info
			    	for (var x in bpsimElementParameters) {
			    		var elementParameter = bpsimElementParameters[x];
			    		if (bpmnTask['$'].id == elementParameter['$'].elementRef && elementParameter['bpsim:TimeParameters'] &&
								elementParameter['bpsim:TimeParameters'][0]['bpsim:ProcessingTime'] && 
								elementParameter['bpsim:TimeParameters'][0]['bpsim:ProcessingTime'][0]['bpsim:UniformDistribution']) {
			    			task.duration = elementParameter['bpsim:TimeParameters'][0]['bpsim:ProcessingTime'][0]['bpsim:UniformDistribution'][0]['$'].max;
			    		}
			    	}
			    	// get associated swimlane info
					if (bpmnProcess.hasOwnProperty('bpmn2:laneSet') && 
							bpmnProcess['bpmn2:laneSet'][0].hasOwnProperty('bpmn2:lane') ) {
					    for (var l in bpmnProcess['bpmn2:laneSet'][0]['bpmn2:lane']) {
					    	var lane = bpmnProcess['bpmn2:laneSet'][0]['bpmn2:lane'][l];
					    	for (var f in lane['bpmn2:flowNodeRef']) {
					    		var flowNodeRef = lane['bpmn2:flowNodeRef'][f];
					    		if (flowNodeRef == bpmnTask['$'].id) {
					    			task.role = lane['$'].name;
					    		}
					    	}
					    }
					}

		    		tasks.push(task);
		    	}
	    	} else if (key == 'bpmn2:callActivity') {
	    		for (var c in bpmnProcess[key]) {
			    	var bpmnCallActivity = bpmnProcess[key][c];
			    	var subProcess = {
			    		id: bpmnCallActivity['$'].id,
			    		name: bpmnCallActivity['$'].name,
			    		processId: bpmnCallActivity['$'].calledElement
			    	};
			    	subProcesses.push(subProcess);
			    	// get associated swimlane info
					if (bpmnProcess.hasOwnProperty('bpmn2:laneSet') && 
							bpmnProcess['bpmn2:laneSet'][0].hasOwnProperty('bpmn2:lane') ) {
					    for (var l in bpmnProcess['bpmn2:laneSet'][0]['bpmn2:lane']) {
					    	var lane = bpmnProcess['bpmn2:laneSet'][0]['bpmn2:lane'][l];
					    	for (var f in lane['bpmn2:flowNodeRef']) {
					    		var flowNodeRef = lane['bpmn2:flowNodeRef'][f];
					    		if (flowNodeRef == bpmnCallActivity['$'].id) {
					    			subProcess.role = lane['$'].name;
					    		}
					    	}
					    }
					}
		    	}
		    }
	    }
	    taskMap.tasks = tasks;
	    if (subProcesses.length > 0) 
	    	taskMap.subProcesses = subProcesses;
	    doneCallback(null, taskMap);
	});               

}

var getSwimlaneRoles = function(request, response) {

	_getBPMN2File(request.params.exercise, request.params.missionId, function (err, bpmnArray) {
        if(err) {
            console.error(err);
            response.json(400, err);
        }
        else {
			async.map(bpmnArray, _getBPMNLanes, function (err, results) {
				var swimlaneRoleArray = [];
				for (var i in results) {
					for (var x in results[i]) {
						if (swimlaneRoleArray.indexOf(results[i][x] == -1)) {
							swimlaneRoleArray.push(results[i][x]);
						}
					}
				}
	            response.json(200, swimlaneRoleArray.sort());
			});
        }
    });
}

var getMissionTasks = function(request, response) {

	_getBPMN2File(request.params.exercise, request.params.missionId, function (err, bpmnArray) {
        if(err) {
            console.error(err);
            response.json(400, { error: err.message });
        }
        else {
        	//console.log('bpmnArray: ', bpmnArray);
			async.map(bpmnArray, _getBPMNTasks, function (err, results) {
                if (err) {
                    response.json(400, err );
                } else if (!results || !results.length > 0) {
                    response.json(400, "{ 'Error': 'No tasks found' }" );
                } else {
                    var tasksArray = results[0].tasks;
                    var subProcesses = results[0].subProcesses;
                    if (subProcesses && subProcesses.length > 0) {
                        async.mapSeries(subProcesses, function( subProcess, itemCallback ) {

                            var jBPMClient = restify.createJsonClient({
                                url: init.getJBPMServiceProps()['jBPMServiceProto'] + '://' +
                                    init.getJBPMServiceProps()['jBPMServiceAddr'] + ':' + init.getJBPMServiceProps()['jBPMServicePort']
                            });
                            jBPMClient.basicAuth(init.getJBPMServiceProps()['jBPMUsername'], init.getJBPMServiceProps()['jBPMPassword']); //  Basic-Auth Credentials go here
                            var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/processDefinitions/' + subProcess.processId;
                            console.log('calling jbpm: ' + uri);
                            jBPMClient.get(uri, function(err, req, res, obj) {
                                if(err) {
                                    console.log("An error ocurred:", err);
                                    itemCallback(err);
                                } else {
                                    var buf = new Buffer(obj.encodedProcessSource, 'base64');
                                    itemCallback(null, buf);
                                }
                            });

                        }, function(err, bpmnSubProcesses) {
                            if( err ) {
                                console.log('error in foreach mission loop', err);
                                response.json(400, err);
                            } else {

                                async.mapSeries(bpmnSubProcesses, _getBPMNTasks, function (err, subProcessResults) {
                                    for (var x in subProcesses) {
                                        var sub = subProcesses[x];
                                        sub.tasks = subProcessResults[x].tasks;
                                    }
                                });

                                response.json(200, results[0]);
                            }

                        });
                    } else {
                        response.json(200, results[0]);
                    }
                }
			});
        }
    });

}

var startMission = function(request, response) {
	var jBPMClient = createClient(true);

	async.waterfall([
		function(callback) {
			
			// must simulate the URL for parsing so localhost is fine
			var uri = 'http://localhost:80/ecs/fve/Missions/' + request.params.exercise + '/' + request.params.missionId;

			var params = { 'missionId': request.params.missionId, 'exercise': request.params.exercise }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(missions, callback) {
			if (missions.length !== 1) 
				callback('no mission found');
			else {
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/runtime/' +
					missions[0].deploymentId + '/process/' + missions[0].processId + '/start';
				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.post(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {

						callback(null, obj);
					}
				});
			}
		},
		function(jbpmProcessInstance, callback) {
			var mongoProcessInstance = {
				missionId: request.params.missionId,     
				pesInstanceId: jbpmProcessInstance.id,     
			    name: jbpmProcessInstance.processId,  // Includes a space	
				state: fveExercise._getEnumList('instanceState', 1),     
			    startTime: new Date()				
			};

			var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + request.params.exercise;

			var params = { 'exercise': request.params.exercise }
			fveExercise._postExerciseDocument(params, uri, mongoProcessInstance, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred:', obj);
					callback(obj);
				} else { 
					callback(null, obj, jbpmProcessInstance);
				}
			});
		}
	], function (err, mongoProcessInstance, jbpmProcessInstance) {
		if (err) {
			response.json(400, err);
		} else {
			response.json(200, mongoProcessInstance);
		}
	});
}

var stopMission = function(request, response) {
	var jBPMClient = createClient(true);

	async.waterfall([
		// Need ProcessInstance for ProcessInstanceID in jBPM
		// then get the Mission Obj for the DeploymentID
		// then get all child processes
		// then abort all processes
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + 
				request.params.exercise + '?missionId=' + request.params.missionId + '&state=ACTIVE';

			var params = { 'exercise': request.params.exercise }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(processInstances, callback) {
			if (processInstances.length != 1) 
				callback('No or incorrect number of processInstances: ' + processInstances.length + '. There can be only 1.');
			else {
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/history/instance/' + processInstances[0].pesInstanceId + '/childWithParent';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {

						callback(null, obj, processInstances[0]);
					}
				});
			}
		},
		function(instances, processInstance, callback) {
			async.mapSeries(instances.list, function( inst, itemCallback ) {

				var instance;
				for (var x in inst) {
					instance = inst[x];
				}
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/runtime/' +
					instance.externalId + '/process/instance/' + instance.processInstanceId + '/abort';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.post(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						itemCallback(err);
					} else {
						itemCallback(null, obj);
					}
				});
		    	
			}, function(err, abbortedTasks) {
			    if( err ) {
				    console.log('error in foreach mission loop', err);
					callback(err);
			    } else {
					callback(null, processInstance);
			    }
			});
		},
		function(processInstance, callback) {
			processInstance.stopTime = new Date();
			processInstance.state = "ABORTED"

			var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + 
				request.params.exercise + '/' + processInstance._id;
			var params = { 'exercise': request.params.exercise, 'processInstanceId': processInstance._id }

			// cannot send id in the document but need it for the URL
			delete processInstance._id;

			fveExercise._putExerciseDocument(params, uri, processInstance, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred:', obj);
					callback(obj);
				} else { 
					callback(null, processInstance);
				}
			});
		}
	], function (err, processInstance) {
		if (err) {
			response.json(400, err);
		} else {
			response.json(200, processInstance);
		}
	});
}

var getUnstartedTasks = function(request, response) {
	_getTaskMapWithSubProcessTasks(request, response, function (exercise, missionId, result, response) {
		getTasksFromjBPMN(exercise, missionId, result, response);
	});
}
var _getTaskMapWithSubProcessTasks = function(request, response, taskCallback) {

	_getBPMN2File(request.params.exercise, request.params.missionId, function (err, bpmnArray) {
        if(err) {
            response.json(400, { error: err.message });
        }
        else {
			async.map(bpmnArray, _getBPMNTasks, function (err, results) {
                if (err) {
                    response.json(400, err );
                } else if (!results || !results.length > 0) {
                    response.json(400, "{ 'Error': 'No tasks found' }" );
                } else {
                    var tasksArray = results[0].tasks;
                    var subProcesses = results[0].subProcesses;

                    if (subProcesses && subProcesses.length > 0) {
                        async.mapSeries(subProcesses, function( subProcess, itemCallback ) {

                            var jBPMClient = restify.createJsonClient({
                                url: init.getJBPMServiceProps()['jBPMServiceProto'] + '://' +
                                    init.getJBPMServiceProps()['jBPMServiceAddr'] + ':' + init.getJBPMServiceProps()['jBPMServicePort']
                            });
                            jBPMClient.basicAuth(init.getJBPMServiceProps()['jBPMUsername'], init.getJBPMServiceProps()['jBPMPassword']); //  Basic-Auth Credentials go here
                            var uri = init.getJBPMServiceProps()['jBPMServiceURI'] + '/rest/processDefinitions/' + subProcess.processId;
                            console.log('calling jbpm: ' + uri);
                            jBPMClient.get(uri, function(err, req, res, obj) {
                                if(err) {
                                    console.log("An error ocurred:", err);
                                    itemCallback(err);
                                } else {
                                    var buf = new Buffer(obj.encodedProcessSource, 'base64');
                                    itemCallback(null, buf);
                                }
                            });

                        }, function(err, bpmnSubProcesses) {
                            if( err ) {
                                console.log('error in foreach mission loop', err);
                                response.json(400, err);
                            } else {
                                async.mapSeries(bpmnSubProcesses, _getBPMNTasks, function (err, subProcessTaskResults) {
                                    for (var x in subProcesses) {
                                        var sub = subProcesses[x];
                                        for (var i in subProcessTaskResults) {
                                            var subTasks = subProcessTaskResults[i];
                                            if (sub.processId == subTasks.processId) {
                                                sub.tasks = subProcessTaskResults[x].tasks;
                                                sub.tasks.map(function (value) {
                                                    value.role = sub.role;
                                                    return value;
                                                });
                                                break;
                                            }
                                        }
                                    }
                                });
                                taskCallback(request.params.exercise, request.params.missionId, results[0], response);
                            }

                        });
                    } else {
                        taskCallback(request.params.exercise, request.params.missionId, results[0], response);
                    }
                }
			});
        }
    });

}


var getTasksFromjBPMN = function(exercise, missionId, taskMapping, response) {

	var jBPMClient = createClient(true);

	async.waterfall([
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + exercise + '?missionId=' + missionId + '&state=ACTIVE';

			var params = { 'exercise': exercise }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(processInstances, callback) {
			if (processInstances.length != 1) {
				callback('Incorrect number of processInstances from database. Size is: ' + processInstances.length);
			} else {
				
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/query?processInstanceId=' + processInstances[0].pesInstanceId;

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {

						callback(null, obj, processInstances[0].pesInstanceId);
					}
				});
			}
		},
		function(jbpmTopLevelTasks, pesInstanceId, callback) {
			var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
				'/rest/history/instance/' + pesInstanceId + '/child';

			console.log('calling jbpm: ', jbpmURI);
			jBPMClient.get(jbpmURI, function(err, req, res, obj) {
			  	if(err) {
			  		console.log("An error ocurred:", err);
					callback(err);
				} else {

					callback(null, obj, jbpmTopLevelTasks);
				}
			});
		},
		function(childProcess, jbpmTopLevelTasks, callback) {

			var childProcesInsIds = [];
			for (var i in childProcess.list) {
				var log = childProcess.list[i];
				for (var x in log) {
					childProcesInsIds.push(log[x].processInstanceId);
				}
			}

			async.mapSeries(childProcesInsIds, function( childProcesInsId, itemCallback ) {

				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/query?processInstanceId=' + childProcesInsId;

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						itemCallback(err);
					} else {
						itemCallback(null, obj);
					}
				});
		    	
			}, function(err, childTasks) {
			    if( err ) {
				    console.log('error in foreach mission loop', err);
		            response.json(400, err);
			    } else {
			    	for (var i in childTasks) {

				    	jbpmTopLevelTasks.list.push.apply(jbpmTopLevelTasks.list, childTasks[i].list);
			    	}
					callback(null, jbpmTopLevelTasks);
			    }
			});
		}
	], function (err, taskList) {
		if (err) {
			response.json(400, err);
		} else {
			var taskArray = [];
			taskArray.push.apply(taskArray, taskMapping.tasks);
			for (var i in taskMapping.subProcesses) {
				var sub = taskMapping.subProcesses[i];
				taskArray.push.apply(taskArray, sub.tasks);
			}

			var returnData = [];
            var RESERVED = fveExercise._getEnumList('taskState', 2);
            var READY = fveExercise._getEnumList('taskState', 1);
			for (var key in taskList.list) {
				if (taskList.list[key].status == READY || taskList.list[key].status == RESERVED) {
					var taskDef = {
						name: taskList.list[key].name,
						pesTaskId: taskList.list[key].id,
						role: 'unknown',
						owner: taskList.list[key].actualOwnerId,
						status: taskList.list[key].status
					}

					for (var i in taskArray) {
						var task = taskArray[i];
						if (taskDef.name == task.name) {
							taskDef.role = task.role;
							taskDef.input = task.input;
							taskDef.output = task.output;
						}
					}
					returnData.push(taskDef);
				}
			}
			response.json(200, returnData);
		}
	});
}

var startTask = function(request, response) {
	_getTaskMapWithSubProcessTasks(request, response, function (exercise, missionId, result, response) {
		_startTask(exercise, missionId, request.params.pesTaskId, result, response);
	});
}


var _startTask = function(exercise, missionId, pesTaskId, result, response) {
	var jBPMClient = createClient(true);

	async.waterfall([
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + 
				exercise + '?missionId=' + missionId + '&state=ACTIVE';

			var params = { 'exercise': exercise }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(processInstances, callback) {
			if (processInstances.length !== 1) {
				console.log('processInstances: ', processInstances[0]);
				callback('Incorrect number of processInstances returned. There can be only 1.');
			} else {
				var uri = 'http://localhost:80/ecs/fve/Missions/' + exercise + '/' + processInstances[0].missionId;

				var params = { 'missionId': processInstances[0].missionId, 'exercise': exercise }
				fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
				  	if(statusCode !== 200) {
				  		console.log('An error ocurred: ', obj);
						callback(obj);
					} else { 
						callback(null, obj, processInstances[0]);
					}
				});
			}
		},
		function(missions, processInstance, callback) {
			if (missions.length !== 1)  {
				callback('Incorrect number of missions returned. There can be only 1.');
			} else {
				
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/query?taskId=' + pesTaskId;

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {

						callback(null, obj, missions, processInstance);
					}
				});
			}
		},
		function(jbpmTask, missions, processInstance, callback) {
			if (jbpmTask.list.length !== 1) {
				callback('Incorrect number of jbpmTasks (' + jbpmTask.list.length + ') returned for Id: ' + pesTaskId);
			} else if (jbpmTask.list[0].status == 'Ready') {

				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/' + pesTaskId + '/claim';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.post(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
							'/rest/task/' + pesTaskId + '/start';

						console.log('calling jbpm: ', jbpmURI);
						jBPMClient.post(jbpmURI, function(err, req, res, obj) {
						  	if(err) {
						  		console.log("An error ocurred:", err);
								callback(err);
							} else {
								callback(null, obj, missions, processInstance);
							}
						});
					}
				});

			} else if (jbpmTask.list[0].status == 'Reserved') {
				
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/' + pesTaskId + '/start';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.post(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						callback(null, obj, missions, processInstance);
					}
				});
			} else {
					callback('Task status could not be started: ' + jbpmTask.list[0]. status);
			}
		},
		function(jbpmResp, missions, processInstance, callback) {
			if (!jbpmResp) {
				console.log('error jbpmResp: ', jbpmResp)
				callback('jBPM Post was not successful.');
			} else {
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/query?taskId=' + pesTaskId;

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						callback(null, obj, missions, processInstance);
					}
				});
			}
		},
		function(jbpmTask, missions, processInstance, callback) {
			if (jbpmTask.list.length !== 1) {
                callback('Incorrect number of jbpmTask.list (' + jbpmTask.list.length +
                    ') returned after calling start in jBPM for Id: ' + pesTaskId);
			} else {	
				var instanceTask = {
				    processInstanceId: processInstance._id,  	
				    missionName: missions[0].name,  
				    pesTaskId: pesTaskId,  
				    name: jbpmTask.list[0].name,  
				    role: 'To be completed', //TODO need to get role/swimlane info  
				    user: jbpmTask.list[0].actualOwnerId,  
				    state: jbpmTask.list[0].status,  
				    startTime: new Date()
				};

				if (result.processId == jbpmTask.list[0].processId) {
					for (var x in result.tasks) {
						var task = result.tasks[x];
						if (task.name == jbpmTask.list[0].name) {
							instanceTask.role = task.role;
                            instanceTask.input = task.input;
                            instanceTask.output = task.output;
                            console.log('task: ', task);
							break;
						}
					}
				} else {
					for (var s in result.subProcesses) {
						var subprocess = result.subProcesses[s];
						for (var x in subprocess.tasks) {
							var task = subprocess.tasks[x];
							if (task.name == jbpmTask.list[0].name) {
                                instanceTask.role = task.role;
                                instanceTask.input = task.input;
                                instanceTask.output = task.output;
                                console.log('task: ', task);
								break;
							}
						}
					}
				}

				var uri = 'http://localhost:80/ecs/fve/InstanceTasks/' + exercise;

				var params = { 'exercise': exercise }
				fveExercise._postExerciseDocument(params, uri, instanceTask, function(statusCode, obj) {
				  	if(statusCode !== 200) {
				  		console.log('An error ocurred:', obj);
						callback(obj);
					} else { 
						callback(null, obj);
					}
				});
			}
		}
	], function (err, taskList) {
		if (err) {
			response.json(400, err);
		} else {
			var returnData = [];
			response.json(200, taskList);
		}
	});
}

var completeTask = function(request, response) {
	var jBPMClient = createClient(true);

    //process:
    // get InstanceTask by ID from database
    // call 'complete' in jBPM with Instance task ID
	async.waterfall([
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/InstanceTasks/' + 
				request.params.exercise + '/' + request.params.instanceTaskId;

			var params = { 'exercise': request.params.exercise, 'instanceTaskId': request.params.instanceTaskId }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
        function(instanceTasks, callback) {
            if (instanceTasks.length !== 1) {
                callback('incorrect number of instanceTasks returned. There can be only 1.');
            } else {
                var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] +
                    '/rest/task/query?taskId=' + instanceTasks[0].pesTaskId;

                console.log('calling jbpm: ', jbpmURI);
                jBPMClient.get(jbpmURI, function(err, req, res, obj) {
                    if(err) {
                        console.log("An error ocurred:", err);
                        callback(err);
                    } else {
                        callback(null, obj, instanceTasks[0]);
                    }
                });
            }
        },
		function(jbpmTask, instanceTask, callback) {
			if (!jbpmTask.list || jbpmTask.list.length == 0) {
                callback('No task found with id: ' + instanceTask.pesTaskId);
            } else if (!jbpmTask.list[0].status == 'InProgress') {
                callback("Task is not currently 'InProgress'. Please try again after the task has started.");
            } else {

				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/' + instanceTask.pesTaskId + '/complete';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.post(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						callback(null, obj, instanceTask);
					}
				});
			}
		},
		function(jbpmResp, instanceTask, callback) {
			if (!instanceTask.pesTaskId || !jbpmResp) {
				callback('jBPM Post was not successful.');
			} else {
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/query?taskId=' + instanceTask.pesTaskId;

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						callback(null, obj, instanceTask);
					}
				});
			}
        },
        function(jbpmTask, instanceTask, callback) {
            var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' +
                request.params.exercise + '/' + instanceTask.processInstanceId;

            var params = { 'exercise': request.params.exercise, 'processInstanceId': instanceTask.processInstanceId }
            fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
                if(statusCode !== 200) {
                    console.log('An error ocurred: ', obj);
                    callback(obj);
                } else {
                    callback(null, jbpmTask, instanceTask, obj[0]);
                }
            });
        },
        function(jbpmTask, instanceTask, processInstance, callback) { // check if process has complete due to a last task
            var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] +
                '/rest/history/instance/' + processInstance.pesInstanceId;

            console.log('calling jbpm: ', jbpmURI);
            jBPMClient.get(jbpmURI, function(err, req, res, jbmpInstances) {
                if(err) {
                    console.log("An error ocurred:", err);
                    callback(err);
                } else {
                    var jbpmInstance;
                    for (var x in jbmpInstances.list[0]) {
                        jbpmInstance = jbmpInstances.list[0][x];
                    }

                    if (jbpmInstance.status != 1) {
                        console.log('found the last task finally! updating processinstance.');
                        var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' +
                            request.params.exercise + '/' + processInstance._id;
                        var params = { 'exercise': request.params.exercise, 'processInstanceId': processInstance._id }

                        delete processInstance._id;
                        processInstance.state = fveExercise._getEnumList('instanceState', jbpmInstance.status);
                        processInstance.stopTime = new Date();
                        fveExercise._putExerciseDocument(params, uri, processInstance, function(statusCode, obj) {
                            if(statusCode !== 200) {
                                console.log('An error ocurred:', obj);
                                callback(obj);
                            } else {
                                callback(null, jbpmTask, instanceTask);
                            }
                        });
                    } else {
                        callback(null, jbpmTask, instanceTask);
                    }
                }
            });
        },
        function(jbpmTask, instanceTask, callback) {
            instanceTask.stopTime = new Date();
            if (jbpmTask.list.length != 0)
                instanceTask.state = jbpmTask.list[0].status;
            else
                instanceTask.state = fveExercise._getEnumList('taskState', 5);

            var uri = 'http://localhost:80/ecs/fve/InstanceTasks/' + request.params.exercise + '/' + instanceTask._id;
            var params = { 'exercise': request.params.exercise, 'instanceTaskId': instanceTask._id }

            // cannot PUT with ID in the object but we need it above in URL and params
            delete instanceTask._id;

            fveExercise._putExerciseDocument(params, uri, instanceTask, function(statusCode, obj) {
                if(statusCode !== 200) {
                    console.log('An error ocurred:', obj);
                    callback(obj);
                } else {
                    callback(null);
                }
            });
		},
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/InstanceTasks/' + 
				request.params.exercise + '/' + request.params.instanceTaskId;

			var params = { 'exercise': request.params.exercise, 'instanceTaskId': request.params.instanceTaskId }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		}
	], function (err, instanceTask) {
		if (err) {
			response.json(400, err);
		} else {
			var returnData = [];
			response.json(200, instanceTask);
		}
	});
}

var getTaskForm = function(request, response) {

	var jBPMClient = createClient(true);

	async.waterfall([
		function(callback) {
			var uri = 'http://localhost:80/ecs/fve/InstanceTasks/' + 
				request.params.exercise + '/' + request.params.instanceTaskId;

			var params = { 'exercise': request.params.exercise, 'instanceTaskId': request.params.instanceTaskId }
			fveExercise._getExerciseDocument(params, uri, function(statusCode, obj) {
			  	if(statusCode !== 200) {
			  		console.log('An error ocurred: ', obj);
					callback(obj);
				} else { 
					callback(null, obj);
				}
			});
		},
		function(instanceTasks, callback) {
			if (instanceTasks.length !== 1) {
				callback('incorrect number of instanceTasks returned. There can be only 1.');
			} else {
				
				var jbpmURI = init.getJBPMServiceProps()['jBPMServiceURI'] + 
					'/rest/task/' + instanceTasks[0].pesTaskId + '/showTaskForm';

				console.log('calling jbpm: ', jbpmURI);
				jBPMClient.get(jbpmURI, function(err, req, res, obj) {
				  	if(err) {
				  		console.log("An error ocurred:", err);
						callback(err);
					} else {
						callback(null, obj);
					}
				});
			}
		}
	], function (err, jbpmTaskForm) {
		if (err) {
			response.json(400, err);
		} else {
			response.writeHead(301, 
				{ Location: jbpmTaskForm.formUrl }
			);
			response.end();
		}
	});
}

// Exported modules
module.exports.getDeploymentSummaries = getDeploymentSummaries;
module.exports.getDeployedProcesses = getDeployedProcesses;
module.exports.getDeployedProcess = getDeployedProcess;
module.exports.getProcessSummary = getProcessSummary;
module.exports.getSwimlaneRoles = getSwimlaneRoles;
module.exports.getMissionTasks = getMissionTasks;
module.exports.startMission = startMission;
module.exports.stopMission = stopMission;
module.exports.getUnstartedTasks = getUnstartedTasks;
module.exports.startTask = startTask;
module.exports.completeTask = completeTask;
module.exports.getTaskForm = getTaskForm;