// Required modules
var async = require('async');
var mongoose = require('mongoose');
var restify = require('restify');
var ecsInit = require('../../config/initialization');

// Defining ENUMs for the exercise state field which will use for validation.
var deploymentState = 'DEPLOYED DEPLOYING NOT_DEPLOYED'.split(' ');
var virtualLanType = 'App Db Dis Org'.split(' ');

// Definition of JSON schema for the ExerciseVirtualSystems collection
var ExerciseVirtualSystemsSchema = mongoose.Schema({
    _id: {type: String, required: false}, 
    name: {type: String, match: /^[A-Za-z0-9-]*$/, required: true},  
    computerName: {type: String, match: /^[A-Za-z0-9-]*$/, required: true},  	
    systemName: {type: String, required: true}, 
    description: {type: String, required: false}, 
    version: {type: String, required: false}, 
    uniqueCloudVmId: {type: String, required: false}, 
	vlans: [{
	    name : {type: String, required: true}, 
	    type : {type: String, enum: virtualLanType, required: true} 
    }],
    templateName: {type: String, required: true},  
    deploymentStatus: {type: String, enum: deploymentState, required: true}, 
    workingStatus: {
	    status : {type: String, required: false},
        currentStage: {type: String, required: false},
        endStage: {type: String, required: false},
	    percentComplete : {type: String, required: false}, 
	    statusDescription : {type: String, required: false}
    },
    time: {type: String, required: false} 
});

var ExerciseVirtualSystemsModel = mongoose.model('ExerciseVirtualSystems', ExerciseVirtualSystemsSchema);

// Definition of JSON schema for the virtualMachine
var vmUpdateSchema = mongoose.Schema({
    uid: {type: String, required: true},
    name: {type: String, match: /^[A-Za-z0-9-]*$/, required: true},
    computerName: {type: String, match: /^[A-Za-z0-9-]*$/, required: true}
});

var VirtualMachineUpdateModel = mongoose.model('vm', vmUpdateSchema);
	
// getExerciseVirtualSystems - Returns the list of virtual system associated 
// with a exercise from the exercise virtual systems collection.
var getExerciseVirtualSystems = function(request, response) {

    console.log('Executing: getExerciseVirtualSystems');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems';

    console.info('GET (' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            response.json(obj);
        }

    });
}

// getExerciseVirtualSystem - Returns the virtual system associated 
// with a exercise record identified by the resource id.
var getExerciseVirtualSystem = function(request, response) {

    console.log('Executing: getExerciseVirtualSystem');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/'+ request.params.id;

    console.info('GET(' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            response.json(obj);
        }

    });
}

// areNamesValid - Checks to determine if the virtual machine 
// name and the computer name are valid names. They must be 
// at least one character and the computer name must be no
// larger than 15 characters.
var areNamesValid = function (name, computerName) {

    var messages = new Array();

    if ( name.length == 0 ) {
        messages.push("Invalid name field, length of field is: " + name.length );
	}
	
	if ( computerName.length < 1 || computerName.length > 15) {
        messages.push("Invalid computer name field, length of field is (restricted to 1-15 chars): " + computerName.length );
	}
    return messages;
}

// postExerciseVirtualSystem - Creates new record in the exercise 
// virtual systems collection with using the json passed in the body.
var postExerciseVirtualSystem = function(request, response) {

    console.log('Executing: postExerciseVirtualSystem');
    console.log("URL (" + request.url + ')');

	var name = new String(request.body['name']);
	var computerName = new String(request.body['computerName']);
    var errorMessages = new Array();
	
	errorMessages = areNamesValid(name, computerName, errorMessages);	
	
    if ( errorMessages.length > 0) {
        response.statusCode = 400
	    response.send(errorMessages);
	}
	else {
        var mongoClient = restify.createJsonClient({
            url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                ecsInit.getMongoServiceProps()['mongoDBServicePort']
        });

        var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/name';

        console.info('POST(' + mongoClient.url.href + uri +')');

        // Validate the JSON against the schema
		new ExerciseVirtualSystemsModel(request.body).validate(function (error) {
            if (error) {
                console.error(error);
                response.send(403, error);
            } else {
                mongoClient.post(uri, request.body, function(err, req, res, obj) {
                    if(err) {
                        console.error(err);
                        response.send(403, err);
                    } else {
                        response.json(obj);
                    }

                });
            }
        });
    }
}

// putExerciseVirtualSystem - Updates the json fields of the record 
// identified by the resource id.
var putExerciseVirtualSystem = function(request, response) {

    console.log('Executing: putExerciseVirtualSystem');
    console.log("URL (" + request.url + ')');

    // Call the database to get the current record and determine if the name or computer is being changed
    // If so then allow change if entry has NOT been deployed.

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/'+ request.params.id;

    console.info('GET(' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            executeExerciseVirtualSystemPut(request, response, obj);
        }
    });
}

var executeExerciseVirtualSystemPut = function(request, response, obj) {

    console.log('Executing: executeExerciseVirtualSystemPut');
    console.log("URL (" + request.url + ')');

    // Check to see if the VM has been deployed or not
    var exerciseVm = obj[0];

    if ( isEmpty(exerciseVm) ) {
        console.log('{"status": "Exercise Virtual System record for ID is empty: ' +
            request.params.id + '"}');
        response.send(403, '{"status": "Exercise Virtual System record for ID is empty: ' +
           request.params.id + '"}');
    }
    else {
        var name = new String(request.body['name']);
        var computerName = new String(request.body['computerName']);
        var errorMessages = new Array();
        errorMessages = areNamesValid(name, computerName, errorMessages);

        if ( errorMessages.length > 0) {
            console.error(new Error("Invalid name or computer name"));
            response.statusCode = 403
            response.send(errorMessages);
        }
        else {
            if (exerciseVm.deploymentStatus == 'DEPLOYING') {
                console.error(new Error("Cannot change Exercise Virtual System data while the virtual machine is being deployed"));
                response.statusCode = 403
                response.send("Cannot change Exercise Virtual System data while the virtual machine is being deployed");
            }
            else if (exerciseVm.deploymentStatus == 'NOT_DEPLOYED') {
                updateVirtualSystemDbRec(request, response, request.body, function (error, result){
                    if(err) {
                        console.error(err);
                        response.send(403, err);
                    } else {
                        response.json(obj);
                    }
                });
            }
            else {
                // Get the vlans list that is being updated
                var vlans = request.body['vlans'];

                if ( name == exerciseVm.name && computerName == exerciseVm.computerName &&
                    JSON.stringify(vlans) == JSON.stringify(exerciseVm.vlans) )  {

                    // There is no need to change anything in the VM cloud
                    updateVirtualSystemDbRec(request, response, request.body, function (error, result){
                        if(error) {
                            console.error(error);
                            response.send(403, error);
                        } else {
                            response.json(obj);
                        }
                    });
                }
                else {
                    async.waterfall([
                        function(callback) {
                            var dataString = JSON.stringify(request.body);
                            var data = JSON.parse(dataString);

                            data.vlans = exerciseVm.vlans;  // Use the existing VLANs

                            // Determine if we need to make a change to the VM in the cloud by changing its
                            // VM name or computer name
                            if ( name != exerciseVm.name || computerName != exerciseVm.computerName ) {
                                var uri = ecsInit.getVmServiceProps()['vmServiceURI'] +
                                    '/virtualMachines/' + request.body.uniqueCloudVmId;

                                // Create an instance of the model schema
                                var vmUpdateMgseObj = new VirtualMachineUpdateModel();
                                vmUpdateMgseObj.computerName = request.body.computerName;
                                vmUpdateMgseObj.name = request.body.name;
                                vmUpdateMgseObj.uid = request.body.uniqueCloudVmId;

                                // Create a regular javascript object from the mongoose and remove the _id element
                                var vmUpdateJsObj = JSON.parse(JSON.stringify(vmUpdateMgseObj));

                                // Delete the _id field from the object
                                if ( vmUpdateJsObj._id ) {
                                    delete vmUpdateJsObj._id;
                                }

                                vmPutRequest(request, response, vmUpdateJsObj, uri, function (error, result) {
                                    if ( error ) {
                                        callback(null, error);
                                    }
                                    else {
                                        updateVirtualSystemDbRec(request, response, data, function (error, result){
                                            callback(null, error);
                                      });
                                    }
                                });
                            }
                            else {
                                callback(null, null);
                            }
                        },
                        function(error, callback) {
                            if ( error ) {
                                callback(error);
                            }
                            else {
                                // Determine if we need to make a change to the VM in the cloud by changing its
                                // VLAN information
                                if ( JSON.stringify(vlans) != JSON.stringify(exerciseVm.vlans)  ) {
                                    var vlansString = "vlans=";

                                    // Create the vlans string from the data in the database record
                                    var str = "";
                                    for ( index in vlans ) {
                                        if ( str == "" ) {
                                            str = vlans[index].type;
                                        }
                                        else {
                                            str = str + ',' + vlans[index].type;
                                        }
                                    }
                                    vlansString = vlansString + str;

                                    // Create the URI for the endpoint
                                    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/vlan/' +
                                        request.body.uniqueCloudVmId + '/' + vlansString;

                                    try {
                                        var ogBodyString = JSON.stringify(request.body);
                                        var ogBody = JSON.parse(ogBodyString);

                                        vmPutRequest(request, response, vlans, uri, function (error, result) {
                                            if ( error ) {
                                                callback(error);
                                            }
                                            else {
                                                updateVirtualSystemDbRec(request, response, ogBody, function (error, result){
                                                    callback(error);
                                                });
                                            }
                                        });
                                    }
                                    catch (err) {
                                        callback(err);
                                    }
                                }
                                else {
                                    callback(null);
                                }
                            }
                        }
                    ],  function (error) {
                        if(error) {
                            console.error(error);
                            response.send(400, error);
                        }
                        else {
                            response.json(200);
                        }
                    })
                }
            }
        }
    }

}

var updateVirtualSystemDbRec = function (request, response, data, doneCallback) {

    console.log('Executing: updateVirtualSystemDbRec');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/' + request.params.id;

    console.info('PUT(' + mongoClient.url.href + uri +')');

    // Validate the JSON against the schema
    new ExerciseVirtualSystemsModel(data).validate(function (error) {
        if (error) {
            doneCallback(error, null);
        } else {
            mongoClient.put(uri, data, function(err, req, res, obj) {
                doneCallback(err, res.body);
            });
        }
    });
}

var vmPutRequest = function(request, response, body,  uri, doneCallback) {

    console.log('Executing: vmPutRequest');
    console.log("URL (" + request.url + ')');

    // Creates a JSON client
    var vmfClient = restify.createJsonClient({
        url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
            ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
            ecsInit.getVmServiceProps()['vmServicePort']
    });

    console.info('PUT(' + vmfClient.url.href + uri +')');

    vmfClient.put(uri, body, function (err, req, res, obj) {
        doneCallback(err, res.body);
    });
}

var deleteExVmFromDb = function(request, response, doneCallback) {

    console.log('Executing: deleteExVmFromDb');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/' + request.params.id;

    console.info('DEL(' + mongoClient.url.href + uri +')');

    mongoClient.del(uri, function(err, req, res) {
        if(err) {
            console.error(err);
            doneCallback(null, err);
        } else {
            doneCallback(null);
        }
    });
}

var deleteExVmFromCloud = function(request, response, exerciseVm, doneCallback) {

    console.log('Executing: deleteExVmFromCloud');
    console.log("URL (" + request.url + ')');

    async.waterfall([
            function(callback) {
                // Create the URI for the endpoint
                var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/virtualMachines/' +
                    exerciseVm.uniqueCloudVmId;

                // Creates a JSON client
                var vmfClient = restify.createJsonClient({
                    url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
                        ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
                        ecsInit.getVmServiceProps()['vmServicePort']
                });

                try {
                    console.info('DEL(' + vmfClient.url.href + uri +')');

                    vmfClient.del(uri, function(err, req, res, obj) {
                        if ( !err ) {
                            console.info('Successfully deleted virtual machine from cloud: ', exerciseVm.name);
                        }
                        callback(null, err);
                    });
                }
                catch (err) {
                    console.error(err);
                    callback(null, err);
                }
            },
            function(err, callback) {
                if ( err ) {
                    // If the virtual machine does not exist in the cloud, then its ok to delete from the DB
                    if (err.message.search("Virtual machine does not exist:") != -1 ) {

                        // Delete the orphan from the database
                        deleteExVmFromDb(request, response, function(err) {
                            callback(err);
                        });
                    }
                    else {
                        callback(err);
                    }
                }
                else {
                    deleteExVmFromDb(request, response, function(err) {
                        callback(err);
                    });
                }
            }
        ],
        function (err) {
            if ( err ) {
                console.error(err);
            }
            doneCallback(err);
        }
    );
}


// deleteExerciseVirtualSystem - Deletes the record identified by the 
// resource id.
var deleteExerciseVirtualSystem = function(request, response) {

    console.log('Executing: deleteExerciseVirtualSystem');
    console.log("URL (" + request.url + ')');

    // Query the database
    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.ExerciseVirtualSystems/' + request.params.id;

    console.info('GET(' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {

            // Check to see if the VM has been deployed or not
            var exerciseVm = obj[0];

            if ( isEmpty(exerciseVm) ) {
                console.error(new Error('{"status": "Exercise Virtual System record for ID is empty: ' +
                    request.params.id + '"}'));

                response.send(400, '{"status": "Exercise Virtual System record for ID is empty: ' +
                    request.params.id + '"}');
            }
            else {
                if (exerciseVm.deploymentStatus == 'NOT_DEPLOYED') {
                    // Just delete from the database since this has not been deployed to the cloud
                    deleteExVmFromDb(request, response, function(err) {
                        if ( err ) {
                            console.error(err);
                            response.send(403, err);
                        } else {
                            console.info('Deleted NOT_DEPLOYED VM successfully');
                            response.json(200);
                        }
                    });
                }
                else {
                    // If the VM is DEPLOYED then use the vm cloud ID to delete the virtual machine from the vloud,
                    // then delete from the database if successful.
                    deleteExVmFromCloud(request, response, exerciseVm, function(err) {
                        if ( err ) {
                            console.error(err);
                            response.send(403, err);
                        } else {
                            console.info('Deleted DEPLOYED VM successfully');
                            response.json(200);
                        }
                    });
                }
            }
        }
    });
}

var updateVirtualSystem = function(uri, body, done) {

    console.log('Executing: updateVirtualSystem');

    async.waterfall([
       function(callback) {
           new ExerciseVirtualSystemsModel(body).validate(function (error) {
               callback(null, error);
           });
       },
       function(error, callback) {
           if ( error ) {
               callback(null, err);
           }
           else {
               var mongoClient = restify.createJsonClient({
                   url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                       ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                       ecsInit.getMongoServiceProps()['mongoDBServicePort']
               });

               try {
                   console.info('PUT(' + mongoClient.url.href + uri +')');

                   mongoClient.put(uri, body, function(err, req, res, obj) {
                       callback(err);
                   });
               }
               catch (err) {
                   console.error(err);
                   callback(err);
               }
           }
       }
    ],
        function (err) {
            if ( err ) {
                console.error(err);
            }
            else {
                console.log('Successfully updated database record: \n', body);
            }
            done(null);
        }
    );
}

var logEventStatus = function(request, response, event, done) {

    console.log('Executing: logEventStatus');
    console.log("URL (" + request.url + ')');
    console.info('Dequeueing - logEventStatus for processing of Event: ', event.name);

    async.waterfall([

        function(callback) {
            // Create the URI for the endpoint
            var uri = '/' + request.params.exercise + '/' + 'midtier.ExerciseVirtualSystems/' + request.params.id

            var mongoClient = restify.createJsonClient({
                url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                    ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                    ecsInit.getMongoServiceProps()['mongoDBServicePort']
            });

            try {
                console.info('GET(' + mongoClient.url.href + uri +')');
                console.info('Initiate DB read for Event: ', event.name );

                mongoClient.get(uri, function (err, req, res, obj) {
                    callback(null, uri, err, req, res, obj);
                });
            }
            catch (err) {
                console.error(err);
                callback(null, err);
            }
        },
        function(uri, err, req, res, obj, callback) {
            if (err) {
                console.error(err);
                response.send(403, err);
            }
            else {
                // Just received the current Virtual Systems record from the database, if the
                // workingStatus property does not exist then create it and add to the Virtual Systems
                // obtained from the returned object from the database.
                var virtualSystem = obj[0];

                if ( isEmpty(virtualSystem) ) {
                    console.info( '{"status": "Exercise Virtual System record for ID is empty: ' +
                        request.params.id + '"}');

                    response.send(403, '{"status": "Exercise Virtual System record for ID is empty: ' +
                        request.params.id + '"}');
                }
                else {
                    // Check to see if the working status exists otherwise create it and add to the
                    // exercise record.
                    if (!virtualSystem.workingStatus) {
                        var status = new Object();
                        status.status = " ";
                        status.currentStage = " ";
                        status.endStage = " ";
                        status.percentComplete = " ";
                        status.statusDescription = " ";
                        virtualSystem.workingStatus = status;
                    }

                    // Delete the _id field from the object, this cannot be in the data to perform a PUT
                    if (virtualSystem._id) {
                        delete virtualSystem._id;
                    }

                    // Get JSON object from event
                    var eventObj = JSON.parse(event.data);

                    switch (event.name) {
                        case 'progressStage':
                            virtualSystem.deploymentStatus = "DEPLOYING";
                            virtualSystem.workingStatus.status = eventObj[0].status;
                            virtualSystem.workingStatus.currentStage = eventObj[0].currentStage;
                            virtualSystem.workingStatus.endStage = eventObj[0].endStage;
                            break;

                        case 'progress':
                            virtualSystem.deploymentStatus = "DEPLOYING";
                            virtualSystem.workingStatus.percentComplete = eventObj[0].progress;
                            break;

                        case 'provisionComplete':
                            virtualSystem.deploymentStatus = "DEPLOYED";
                            virtualSystem.uniqueCloudVmId = eventObj[0].uid;
                            break;

                        case 'apperror':
                            virtualSystem.deploymentStatus = "NOT_DEPLOYED";
                            virtualSystem.workingStatus.statusDescription = eventObj[0].error;
                            break;

                        default:        // Message with no event name, info messages from VMF
                            virtualSystem.deploymentStatus = "DEPLOYING";
                            virtualSystem.workingStatus.statusDescription = eventObj[0].message;
                    }

                    callback(null, uri, virtualSystem);
                }
            }
        },
        function(uri, virtualSystem, callback) {

            // Update the database with the provisioning  status from VMF.
            updateVirtualSystem(uri, virtualSystem, function(err) {
                callback(null);
            });
        }
    ],
        function (err) {
            if ( err ) {
                console.error(err);
            }
            done(null);
        }
    );
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
//
// Exported modules
module.exports.getExerciseVirtualSystems = getExerciseVirtualSystems;
module.exports.getExerciseVirtualSystem = getExerciseVirtualSystem;
module.exports.postExerciseVirtualSystem = postExerciseVirtualSystem;
module.exports.putExerciseVirtualSystem = putExerciseVirtualSystem;
module.exports.deleteExerciseVirtualSystem = deleteExerciseVirtualSystem;
module.exports.logEventStatus = logEventStatus;


