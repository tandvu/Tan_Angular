var init 		= require('../../config/initialization');
var restify 	= require('restify');
var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var url 		= require('url');
var querystring = require("querystring");
var async       = require('async');

//collection names:
const MISSION_COLLECTION = 'midtier.Missions';
const METS_COLLECTION = 'midtier.Mets';
const MISSION_PRODUCTS_COLLECTION = 'midtier.MissionProducts';
const MISSION_METRICS_COLLECTION = 'midtier.MissionMetrics';
const ROLE_ASSIGNMENTS_COLLECTION = 'midtier.RoleAssignments';
const USERS_COLLECTION = 'midtier.Users';
const PROCESS_INSTANCES_COLLECTION = 'midtier.ProcessInstances';
const INSTANCE_ROLES_COLLECTION = 'midtier.InstanceRoles';
const INSTANCE_TASKS_COLLECTION = 'midtier.InstanceTasks';
const INSTANCE_VARIABLES_COLLECTION = 'midtier.InstanceVariables';

var enumList = {
     inputOutput : ['input', 'output'],
     assignment : ['Training Audience', 'Trainer', 'Simulated Role'],
     group : ['Planner', 'Trainer', 'Modeller', 'Trainee', 'Admin'],
     metricValues : ['Green', 'Blue', 'Yellow', 'Red'],
     instanceState : [ 'PENDING', 'ACTIVE', 'COMPLETED', 'ABORTED', 'SUSPENDED'],
     taskState : [ 'Created', 'Ready', 'Reserved', 'InProgress', 'Suspended', 'Completed', 'Failed', 'Error', 'Exited', 'Obsolete']
 };

// Definition of JSON schema for the ExerciseMissions collection
var MissionsSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    name: {type: String, match: /^[A-Za-z0-9_ -]*$/, required: true},  // Includes a space	
    processName: {type: String, required: true}, 
    deploymentId: {type: String, required: true}, 
    processId: {type: String, required: true}, 
    time: {type: Date, required: false} 
});

var MissionProductsSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    missionId: {type: Schema.Types.ObjectId, required: true}, 
    name: {type: String, match: /^[A-Za-z0-9_ -]*$/, required: true},  // Includes a space	
    description: {type: String, required: true}, 
    role: {type: String, required: true}, 
    taskName: {type: String, required: true}, 
    inputOutput: {type: String, enum: enumList.inputOutput, required: true}, 
    assignment: {type: String, enum: enumList.assignment, required: true},
    path: {type: String, required: true},
    filename: {type: String, required: true},
    url: {type: String, required: false},
    time: {type: Date, required: false}
});

// Definition of JSON schema for the ExerciseMets collection
var MetsSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    name: {type: String, required: true},  // Includes a space	
	number: {type: String, required: true},     
	description: {type: String, required: true},     
    measures: [ {
	    number : {type: String, required: true}, 
	    measureText : {type: String, required: true}
    } ],	
    isUsed: {type: Boolean, required: true}, 
    time: {type: Date, required: false} 
});

// Definition of JSON schema for the MissionMetricsSchema collection
var MissionMetricsSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
	metId: {type: Schema.Types.ObjectId, required: true},     
	missionId: {type: Schema.Types.ObjectId, required: true},     
    metrics: [ {
	    number : {type: String, required: true}, 
	    measureText : {type: String, required: true}, 
	    value : {type: String, required: false}, 
	    comment : {type: String, required: false}
    } ],	
    time: {type: Date, required: false} 
});

// Definition of JSON schema for the RoleAssignmentsSchema collection
var RoleAssignmentsSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    role: {type: String, required: true}, 
    assignment: {type: String, enum: enumList.assignment, required: true}, 
    time: {type: Date, required: false} 
});

// Definition of JSON schema for the UsersSchema collection
var UsersSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    ldapId: {type: String, required: true},  	
    info: {
	    name : {type: String, required: true}, 
	    email : {type: String, required: true}, 
	    phone : {type: String, required: true}
    }, 	
    role: {type: String, required: true},  
    group: {type: String, enum: enumList.group , required: true},  
    time: {type: Date, required: false} 
});

// Definition of JSON schema for the ProcessInstancesSchema collection
var ProcessInstancesSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
	missionId: {type: Schema.Types.ObjectId, required: true},     
	pesInstanceId: {type: String, required: true},     
    name: {type: String, required: true},  // Includes a space	
	state: {type: String, enum: enumList.instanceState, required: true},     
    startTime: {type: Date, required: false},
    stopTime: {type: Date, required: false} 
});

var InstanceRolesSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    processInstanceId: {type: Schema.Types.ObjectId, required: true},  	
    roleAssignmentId: {type: Schema.Types.ObjectId, required: true}, 	
    userId: {type: Schema.Types.ObjectId, required: true},  
    time: {type: Date, required: false} 
});

var InstanceVariablesSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    processInstanceId: {type: Schema.Types.ObjectId, required: true},  	
    name: {type: String, required: true},  
    value: {type: String, required: true},  
    time: {type: Date, required: false} 
});

var InstanceTasksSchema = mongoose.Schema({
    _id: {type: Schema.Types.ObjectId, required: false}, 
    processInstanceId: {type: Schema.Types.ObjectId, required: true},  	
    missionName: {type: String, required: true},  
    pesTaskId: {type: String, required: true},  
    name: {type: String, required: true},  
    role: {type: String, required: false},  
    user: {type: String, required: true},  
    state: {type: String, enum: enumList.taskState, required: true},  
    startTime: {type: Date, required: false},  
    stopTime: {type: Date, required: false},
    input: [ {
        name : {type: String, required: true},
        description : {type: String, required: false},
        url: {type: String, required: false}
    } ],
    output: [ {
        name : {type: String, required: true},
        description : {type: String, required: false},
        url: {type: String, required: false}
    } ]
});

var MissionModel = mongoose.model('Missions', MissionsSchema);
var MetsModel = mongoose.model('Mets', MetsSchema);
var MissionProductModel = mongoose.model('MissionProducts', MissionProductsSchema);
var MissionMetricModel = mongoose.model('MissionMetrics', MissionMetricsSchema);
var RoleAssignmentModel = mongoose.model('RoleAssignments', RoleAssignmentsSchema);
var UsersModel = mongoose.model('Users', UsersSchema);
var ProcessInstancesModel = mongoose.model('ProcessInstances', ProcessInstancesSchema);
var InstanceRolesModel = mongoose.model('InstanceRoles', InstanceRolesSchema);
var InstanceVariablesModel = mongoose.model('InstanceVariables', InstanceVariablesSchema);
var InstanceTasksModel = mongoose.model('InstanceTasks', InstanceTasksSchema);

var getEnumList = function(request, response) {
	if (request.params.enumId) {
		console.log('Executing: getEnumList: ' + request.params.enumId);

		if (enumList.hasOwnProperty(request.params.enumId)) {
			response.json(enumList[request.params.enumId]);
		}
	} else {
		var keys = Object.keys(enumList);
		response.json(keys);
	}
}

var _getEnumList = function(list, index) {
	return enumList[list][index];
}

var getExerciseDocument = function(request, response) {
	_getExerciseDocument(request.params, request.url, function(statusCode, obj) {
		response.json(statusCode, obj);
	});
}

var _getExerciseDocument = function(params, urlStr, responseCallback) {
	console.log('Executing: getExerciseDocument');

	// Creates a JSON client
	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

	//parse URL
	var url_parts = url.parse(urlStr, true);	
	//set the database; all routes have 'id'
	var uri = '/' + params.exercise;

	//determine collection form URI/path
	if (url_parts.pathname.indexOf('/ecs/fve/Missions/') !=-1) {
		uri = uri + '/' + MISSION_COLLECTION; 
		if (params.missionId)
			uri = uri + '/' + params.missionId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/Mets') !=-1) {
		uri = uri + '/' + METS_COLLECTION;
		if (params.metsId)
			uri = uri + '/' + params.metsId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/MissionProducts') !=-1) {
		uri = uri + '/' + MISSION_PRODUCTS_COLLECTION;
		if (params.missionProductId)
			uri = uri + '/' + params.missionProductId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/MissionMetrics') !=-1) {
		uri = uri + '/' + MISSION_METRICS_COLLECTION;
		if (params.missionMetricId)
			uri = uri + '/' + params.missionMetricId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/RoleAssignments') !=-1) {
		uri = uri + '/' + ROLE_ASSIGNMENTS_COLLECTION;
		if (params.roleAssignmentId)
			uri = uri + '/' + params.roleAssignmentId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/Users') !=-1) {
		uri = uri + '/' + USERS_COLLECTION;
		if (params.userId)
			uri = uri + '/' + params.userId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/ProcessInstances') !=-1) {
		uri = uri + '/' + PROCESS_INSTANCES_COLLECTION;
		if (params.processInstanceId)
			uri = uri + '/' + params.processInstanceId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceRoles') !=-1) {
		uri = uri + '/' + INSTANCE_ROLES_COLLECTION;
		if (params.instanceRoleId)
			uri = uri + '/' + params.instanceRoleId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceTasks') !=-1) {
		uri = uri + '/' + INSTANCE_TASKS_COLLECTION;
		if (params.instanceTaskId)
			uri = uri + '/' + params.instanceTaskId;
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceVariables') !=-1) {
		uri = uri + '/' + INSTANCE_VARIABLES_COLLECTION;
		if (params.instanceVariableId)
			uri = uri + '/' + params.instanceVariableId;
	} else {
		console.log('An error ocurred: ', "{ Error: 'could not determin path'}");
		responseCallback(403, "{ Error: 'could not determin path'}");
	}

	var query = url_parts.query;
	var result = querystring.stringify(query);
	if (result) {
		uri = uri + '?' + result;
	}

	console.log('calling mongoDB: ' + uri);

	mongoClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log('An error ocurred: ', err);
	  		if (err.statusCode == 404) {
	  			var emptyArr = [];
				responseCallback(200, emptyArr);
	  		} else {
				responseCallback(err.statusCode, err);
	  		}
		} else { 
			responseCallback(200, obj);
		}
	});

}

var postExerciseDocument = function(request, response) {
	_postExerciseDocument(request.params, request.url, request.body, function(statusCode, obj) {
		response.json(statusCode, obj);
	});
}

var _postDocument = function(err, uri, documentArray, resCallback) {
	// Creates a JSON client
	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

    if( err ) {
		console.log('An error ocurred:', err);
		resCallback(403, err);
    } else {
        console.log('calling mongoDB: ' + uri);
		mongoClient.post(uri, documentArray, function(err, req, res, obj) {
		  	if(err) {
		  		console.log('An error ocurred:', err);
				resCallback(403, err);
			} else { 
				resCallback(200, obj);
			}
		});
    }
}

var _postDocumentWithUpdate  = function(error, exercise, uri, documentArray, updateCallback, resCallback) {

	if (error) {
		console.log('An error ocurred:', error);
		resCallback(400, error);
	} else {
		// Creates a JSON client
		var mongoClient = restify.createJsonClient({
		  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
		  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
		});

		console.log('calling mongoDB: ' + uri);
		mongoClient.post(uri, documentArray, function(err, req, res, obj) {
		  	if(err) {
		  		console.log('An error ocurred:', err);
				resCallback(403, err);
			} else { 
				updateCallback(exercise, documentArray, obj, resCallback);
			}
		});
	}
}

var _updateMission = function(exercise, documentArray, mongoResp, resCallback) {

    async.each(documentArray, function( doc, callback) {
        async.waterfall([
            function(callback) {
                if (doc.processInstanceId) {
                    var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + exercise + '/' + doc.processInstanceId;

                    var params = { 'exercise': exercise, 'processInstanceId': doc.processInstanceId }
                    _getExerciseDocument(params, uri, function(statusCode, obj) {
                        if(statusCode !== 200) {
                            console.log('An error ocurred: ', obj);
                            callback(obj);
                        } else {
                            callback(null, obj, doc);
                        }
                    });
                } else {
                    callback(null, null, doc);
                }
            },
            function(processInstances, doc, callback) { // update the missions
                if (!processInstances) {
                    console.log('no processInstance');
                    callback(null, null, doc);
                } else if (processInstances.length != 1) {
                    callback('incorrect number of processInstances returned: ', processInstances.length);
                } else {
                    var uri = 'http://localhost:80/ecs/fve/ProcessInstances/' + exercise + '/' + processInstances[0]._id;
                    var params = { 'exercise': exercise, 'processInstanceId': processInstances[0]._id }
                    delete processInstances[0]._id;
                    _putExerciseDocument(params, uri, processInstances[0], function(statusCode, obj) {
                        if(statusCode !== 200) {
                            console.log('An error ocurred: ', obj);
                            callback(obj);
                        } else {
                            callback(null, processInstances[0], doc);
                        }
                    });
                }
            },
            function(processInstance, doc, callback) { // get the Mission to update it
                var missionId;
                if (doc.missionId) {
                    missionId = doc.missionId;
                } else if (processInstance.missionId) {
                    missionId = processInstance.missionId;
                }

                if (!missionId) {
                    console.log('no missionId ', processInstance, doc);
                    callback('no missionId found: ', processInstance, doc);
                } else {
                    var uri = 'http://localhost:80/ecs/fve/Missions/' + exercise + '/' + missionId;

                    var params = { 'exercise': exercise, 'missionId': missionId }
                    _getExerciseDocument(params, uri, function(statusCode, obj) {
                        if(statusCode !== 200) {
                            console.log('An error ocurred: ', obj);
                            callback(obj);
                        } else {
                            callback(null, obj[0], doc);
                        }
                    });
                }
            },
            function(mission, doc, callback) { // update the missions
                if (!mission) {
                    callback('no mission found');
                } else {
                    var uri = 'http://localhost:80/ecs/fve/Missions/' + exercise + '/' + mission._id;
                    var params = { 'exercise': exercise, 'missionId': mission._id }
                    delete mission._id;
                    _putExerciseDocument(params, uri, mission, function(statusCode, obj) {
                        if(statusCode !== 200) {
                            console.log('An error ocurred: ', obj);
                            callback(obj);
                        } else {
                            callback(null);
                        }
                    });
                }
            }
        ], function (err) {
            if (err)
                callback(err)
            else
                callback(null);
        });
    }, function(err) {
        if (err) {
            mongoResp.err = err;
        }
        resCallback(200, mongoResp);
    });
}

var _postExerciseDocument = function(params, urlStr, doc, resCallback) {
	console.log('Executing: postExerciseDocument');

	var uri = '/' + params.exercise;

	//parse URL
	var url_parts = url.parse(urlStr, true);	

	// merge into array
	var documentArray = [];
	if (doc.length) {
		documentArray = doc;
	} else {
		documentArray.push(doc);
	}

	var validationError = null;
	//determine collection form URI/path
	if (url_parts.pathname.indexOf('/ecs/fve/Missions/') != -1) {		
		uri = uri + '/' + MISSION_COLLECTION + '/name';

		async.each(documentArray, function( doc, callback) {
			var model = new MissionModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err) {
		    // if any of the file processing produced an error, err would equal that error
		    _postDocument(err, uri, documentArray, resCallback);
		});

	} else if (url_parts.pathname.indexOf('/ecs/fve/Mets') != -1) {
		uri = uri + '/' + METS_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new MetsModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocument(err, uri, documentArray, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/MissionProducts') != -1) {
		uri = uri + '/' + MISSION_PRODUCTS_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new MissionProductModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocument(err, uri, documentArray, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/MissionMetrics') != -1) {
		uri = uri + '/' + MISSION_METRICS_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new MissionMetricModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocumentWithUpdate(err, params.exercise, uri, documentArray, _updateMission, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/RoleAssignments') != -1) {
		uri = uri + '/' + ROLE_ASSIGNMENTS_COLLECTION + '/role';
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new RoleAssignmentModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocument(err, uri, documentArray, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/Users') != -1) {
		uri = uri + '/' + USERS_COLLECTION + '/ldapId';
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new UsersModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocument(err, uri, documentArray, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/ProcessInstances') != -1) {
		uri = uri + '/' + PROCESS_INSTANCES_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new ProcessInstancesModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocumentWithUpdate(err, params.exercise, uri, documentArray, _updateMission, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceRoles') != -1) {
		uri = uri + '/' + INSTANCE_ROLES_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new InstanceRolesModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocumentWithUpdate(err, params.exercise, uri, documentArray, _updateMission, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceTasks') != -1) {
		uri = uri + '/' + INSTANCE_TASKS_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new InstanceTasksModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocumentWithUpdate(err, params.exercise, uri, documentArray, _updateMission, resCallback);
		});
	} else if (url_parts.pathname.indexOf('/ecs/fve/InstanceVariables') != -1) {
		uri = uri + '/' + INSTANCE_VARIABLES_COLLECTION;
		console.log('calling mongoDB: ' + uri);

		async.each(documentArray, function( doc, callback) {
			var model = new InstanceVariablesModel(doc);
			model.validate(function (error) {			  
		        if (error) {
			  		callback(error);
				} else 
					callback();
			});
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    _postDocumentWithUpdate(err, params.exercise, uri, documentArray, _updateMission, resCallback);
		});
	} else {
		resCallback(403, "{ Error: 'could not determin path'}");
		return;
	}
}


var putExerciseDocument = function(request, response) {
	_putExerciseDocument(request.params, request.url, request.body, function(statusCode, obj) {
		response.json(statusCode, obj);
	});
}

var _putDocument = function(uri, model, doc, resCallback) {
	console.log('inside _putDocument');
	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

	console.log('calling mongoDB: ' + uri);
	model.validate(function (error) {
		if (error) {
			resCallback(403, error);
		} else {
			mongoClient.put(uri, doc, function(err, req, res, obj) {
			  	if(err) {
			  		console.log('An error ocurred:', err);
					resCallback(403, err);
				} else { 
					resCallback(200, obj);
				}

			});
		}
	});
}
var _putDocumentWithUpdates = function(exercise, uri, model, doc, resCallback, updateCallback) {
	console.log('inside _putDocumentWithUpdates');
	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

	console.log('calling mongoDB: ' + uri);
	model.validate(function (error) {
		if (error) {
			resCallback(403, error);
		} else {
			mongoClient.put(uri, doc, function(err, req, res, obj) {
			  	if(err) {
			  		console.log('An error ocurred:', err);
					resCallback(403, err);
				} else {
                    var docArray = [];
                    docArray.push(doc);
					updateCallback(exercise, docArray, obj, resCallback);
				}

			});
		}
	});
}

var _putExerciseDocument = function(params, urlStr, doc, resCallback) {
	console.log('Executing: _putExerciseDocument');
	// Creates a JSON client

	//parse URL
	var url_parts = url.parse(urlStr, true);	
	//set the database; all routes have 'id'
	var uri = '/' + params.exercise ;

	if (params.missionId && url_parts.pathname.indexOf('/ecs/fve/Missions/') != -1) {
		uri = uri + '/' + MISSION_COLLECTION + '/' + params.missionId;
		_putDocument(uri, new MissionModel(doc), doc, resCallback);

	} else if (params.metId && url_parts.pathname.indexOf('/ecs/fve/Mets') != -1) {
		uri = uri + '/' + METS_COLLECTION + '/' + params.metId;
		_putDocument(uri, new MetsModel(doc), doc, resCallback);

	} else if (params.missionProductId && url_parts.pathname.indexOf('/ecs/fve/MissionProducts') != -1) {
		uri = uri + '/' + MISSION_PRODUCTS_COLLECTION + '/' + params.missionProductId;
		_putDocumentWithUpdates(params.exercise, uri, new MissionProductModel(doc), doc, resCallback, _updateMission);

	} else if (params.missionMetricId && url_parts.pathname.indexOf('/ecs/fve/MissionMetrics') != -1) {
		uri = uri + '/' + MISSION_METRICS_COLLECTION + '/' + params.missionMetricId;
		_putDocumentWithUpdates(params.exercise, uri, new MissionMetricModel(doc), doc, resCallback, _updateMission);

	} else if (params.roleAssignmentId && url_parts.pathname.indexOf('/ecs/fve/RoleAssignments') != -1) {
		uri = uri + '/' + ROLE_ASSIGNMENTS_COLLECTION + '/' + params.roleAssignmentId;
		_putDocument(uri, new RoleAssignmentModel(doc), doc, resCallback);

	} else if (params.userId && url_parts.pathname.indexOf('/ecs/fve/Users') != -1) {
		uri = uri + '/' + USERS_COLLECTION + '/' + params.userId;
		_putDocument(uri, new UsersModel(doc), doc, resCallback);

	} else if (params.processInstanceId && url_parts.pathname.indexOf('/ecs/fve/ProcessInstances') != -1) {
		uri = uri + '/' + PROCESS_INSTANCES_COLLECTION + '/' + params.processInstanceId;
		_putDocumentWithUpdates(params.exercise, uri, new ProcessInstancesModel(doc), doc, resCallback, _updateMission);

	} else if (params.instanceRoleId && url_parts.pathname.indexOf('/ecs/fve/InstanceRoles') != -1) {
		uri = uri + '/' + INSTANCE_ROLES_COLLECTION + '/' + params.instanceRoleId;
		_putDocumentWithUpdates(params.exercise, uri, new InstanceRolesModel(doc), doc, resCallback, _updateMission);

	} else if (params.instanceTaskId && url_parts.pathname.indexOf('/ecs/fve/InstanceTasks') != -1) {
		uri = uri + '/' + INSTANCE_TASKS_COLLECTION + '/' + params.instanceTaskId;
		_putDocumentWithUpdates(params.exercise, uri, new InstanceTasksModel(doc), doc, resCallback, _updateMission);

	} else if (params.instanceVariableId && url_parts.pathname.indexOf('/ecs/fve/InstanceVariables') != -1) {
		uri = uri + '/' + INSTANCE_VARIABLES_COLLECTION + '/' + params.instanceVariableId;
		_putDocumentWithUpdates(params.exercise, uri, new InstanceVariablesModel(doc), doc, resCallback, _updateMission);

	} else {
		console.log("Error. No matching document ID's");		
		resCallback(403, "{ Error: 'Did not find document ObjectId in URL to update.'}");
	}

}

var deleteExerciseDocument = function(request, response) {
	console.log('Executing: deleteExerciseDocument');
	// Creates a JSON client
	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

	var uri = '/' + request.params.exercise;

	if (request.params.missionId) {
		uri = uri + '/' + MISSION_COLLECTION + '/' + request.params.missionId;
	} else if (request.params.metId) {
		uri = uri + '/' + METS_COLLECTION + '/' + request.params.metId;
	} else if (request.params.missionProductId) {
		uri = uri + '/' + MISSION_PRODUCTS_COLLECTION + '/' + request.params.missionProductId;
	} else if (request.params.missionMetricId) {
		uri = uri + '/' + MISSION_METRICS_COLLECTION + '/' + request.params.missionMetricId;
	} else if (request.params.roleAssignmentId) {
		uri = uri + '/' + ROLE_ASSIGNMENTS_COLLECTION + '/' + request.params.roleAssignmentId;
	} else if (request.params.userId) {
		uri = uri + '/' + USERS_COLLECTION + '/' + request.params.userId;
	} else if (request.params.processInstanceId) {
		uri = uri + '/' + PROCESS_INSTANCES_COLLECTION + '/' + request.params.processInstanceId;
	} else if (request.params.instanceRoleId) {
		uri = uri + '/' + INSTANCE_ROLES_COLLECTION + '/' + request.params.instanceRoleId;
	} else if (request.params.instanceTaskId) {
		uri = uri + '/' + INSTANCE_TASKS_COLLECTION + '/' + request.params.instanceTaskId;
	} else if (request.params.instanceVariableId) {
		uri = uri + '/' + INSTANCE_VARIABLES_COLLECTION + '/' + request.params.instanceVariableId;
	} else {
  		console.log('Could not find route');
		response.send(403, "{ Error: 'Did not find document ObjectId in URL to update.'}");
	}

	console.log('calling mongoDB: ' + uri);

	mongoClient.del(uri, function(err, req, res) {
	  	if(err) {
	  		console.log('An error ocurred:', err);
	  		response.json(403, err);
		} else { 
			response.json(200);
		}
	});

}


// Exported modules
module.exports.getEnumList = getEnumList;
module.exports._getEnumList = _getEnumList;
module.exports.getExerciseDocument = getExerciseDocument;
module.exports._getExerciseDocument = _getExerciseDocument;
module.exports.postExerciseDocument = postExerciseDocument;
module.exports._postExerciseDocument = _postExerciseDocument;
module.exports.putExerciseDocument = putExerciseDocument;
module.exports._putExerciseDocument = _putExerciseDocument;
module.exports.deleteExerciseDocument = deleteExerciseDocument;
