// Required modules
var async = require('async');
var init = require('../config/initialization');
var mongoose = require('mongoose');
var restify = require('restify');
var querystring = require("querystring");
var url         = require('url');


// Definition of JSON schema for the Exercises collection
var ExercisesSchema = mongoose.Schema({
    _id: {type: String, required: false}, 
    name: {type: String, match: /^[A-Za-z0-9_-]{0,64}$/, required: true},  // No spaces allowed
    displayName: {type: String, match: /^[A-Za-z0-9_ -]{0,64}$/, required: true},  // Spaces allowed
	command: {type: String, required: false},
	description: {type: String, required: false}, 
    poc: {
	    name : {type: String, required: true}, 
	    email : {type: String, required: true}, 
	    phone : {type: String, required: true}
    }, 	
    startTime: {type: String, required: false}, 
    stopTime: {type: String, required: false}, 	
    vmWorkingStatus: {
	    status : {type: String, required: false},
        currentStage: {type: String, required: false},
        endStage: {type: String, required: false},
	    percentComplete : {type: String, required: false}, 
	    statusDescription : {type: String, required: false}
    },	
	filepath: {type: String, required: false}, 
    time: {type: String, required: false} 
});

var ExercisesModel = mongoose.model('Exercises', ExercisesSchema);


// getExercises - Returns the list of exercises from the exercises 
// collection.
var getExercises = function(request, response) {

    console.log('Executing: getExercises');
    console.log("URL (" + request.url + ')');

	var mongoClient = restify.createJsonClient({
	  url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
	  	init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort'] 
	});

	var uri = "/SystemConfig/midtier.Exercises";

    var url_parts = url.parse(request.url, true);   
    var query = url_parts.query;
    var result = querystring.stringify(query);
    if (result) {
        uri = uri + '?' + result;
    }

    console.info('GET(' + mongoClient.url.href + uri +')');

	mongoClient.get(uri, function(err, req, res, obj) {
	  	if(err) {
	  		console.log('An error occurred: ', err);
			response.send(403, err);
		} else { 
			response.json(obj);
		}
	});
}


// getExercise - Returns the exercise record identified by the resource id.
var getExercise = function(request, response) {

    console.log('Executing: getExercise');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = "/SystemConfig/midtier.Exercises" + '/' + request.params.id;

    console.info('GET(' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.log('An error occurred: ', err);
            response.send(403, err);
        } else {
            response.json(obj);
        }
    });
}

// postExercise - Creates new record in the exercises collection 
// with using the json passed in the body.
var postExercise = function(request, response) {

    console.log('Executing: postExercise');
    console.log("URL (" + request.url + ')');

	var name = new String(request.body['name']);
	
    if ( name.length == 0 ) {
        response.statusCode = 400
	    response.send("Invalid name field, length of field is: " + name.length );
	}
	else {
		// Validate the JSON against the schema
		new ExercisesModel(request.body).validate(function (error) {
			if ( error ) {
                console.error(error);
				response.statusCode = 400;
				response.send(error);
			}
			else {
				async.series([
					function(callback) {
						// Create the exercise database and create a exercise attribute collection
						// within it to force the creation of the database
						exerciseDBPostCode(request, response, callback)
					},
					function(callback) {	
						exerciseCollectionPostCode(request, response, callback)
					}
				],  function (err, results) {
						if(err) {
                            console.error(err);
							response.send(400);
						}
						else {
							response.json(results[1]); // Send the json representation of the results of the second function
						}
					})
			}
		});	
	}
}

// exerciseDBPostCode - Creates an exercise database and creates a dummy 
// collection identifying the exercise.
var exerciseDBPostCode = function(request, response, callback) {

    console.log('Executing: exerciseDBPostCode');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.body['name'] + '/midtier.ExerciseAttributes';

    // Build up the exercise attributes collection record so we can
    // get the exercise database created
    var exerciseAttributes = {
        name : request.body['name']
    };

    console.info('POST(' + mongoClient.url.href + uri +')');

    mongoClient.post(uri, exerciseAttributes, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            callback(new Error('Invalid Response'), null);
        } else {
            callback(null, obj);
        }
    });
}

// exerciseCollectionPostCode - creates entry in the exercise collection for 
// the exercise.
var exerciseCollectionPostCode = function(request, response, callback) {

    console.log('Executing: exerciseCollectionPostCode');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = "/SystemConfig/midtier.Exercises/name";

    console.info('POST(' + mongoClient.url.href + uri +')');

    mongoClient.post(uri, request.body, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            callback(new Error('Invalid Response'), null);
        } else {
            callback(null, obj);
        }
    });
}


// putExercise - Updates the json fields of the record identified
// by the resource id.
var putExercise = function(request, response) {

    console.log('Executing: putExercise');
    console.log("URL (" + request.url + ')');

    // Call the database to get the current record and determine if the name is being changed
    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/SystemConfig/midtier.Exercises/' + request.params.id;

    console.info('GET(' + mongoClient.url.href + uri +')');

    mongoClient.get(uri, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            var exercise = obj[0];

            if ( request.body['name'] != exercise.name) {
                response.send(403, "Exercises cannot be renamed, this is an invalid request");
            }
            else {
                updateExerciseDbRec(request, response);
            }
        }
    });
}

var updateExerciseDbRec = function(request, response) {

    console.log('Executing: updateExerciseDbRec');

    var name = new String(request.body['name']);

    if ( name.length == 0 ) {
        response.statusCode = 400
        response.send("Invalid name field, length of field is: " + name.length );
    }
    else {
        var mongoClient = restify.createJsonClient({
            url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                init.getMongoServiceProps()['mongoDBServicePort']
        });

        var uri = '/SystemConfig/midtier.Exercises/' + request.params.id;

        console.info('PUT(' + mongoClient.url.href + uri +')');

        // Validate the JSON against the schema
        new ExercisesModel(request.body).validate(function (error) {
            if (error) {
                console.error(error);
                response.send(403, error);
            } else {
                mongoClient.put(uri, request.body, function(err, req, res, obj) {
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

// deleteExercise - Deletes the record identified by the resource id.
var deleteExercise = function(request, response) {

    console.log('Executing: deleteExercise');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/SystemConfig/midtier.Exercises/' + request.params.id;

    console.info('DEL(' + mongoClient.url.href + uri +')');

    mongoClient.del(uri, function(err, req, res) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            response.json(200);
        }
    });
}

var updateExerciseVmStatus = function(uri, body, done) {

    console.log('Executing: updateExerciseVmStatus');

    async.waterfall([
            function(callback) {
                new ExercisesModel(body).validate(function (error) {
                    callback(null, error);
                });
            },
            function(error, callback) {
                if ( error ) {
                    callback(null, err);
                }
                else {
                    var mongoClient = restify.createJsonClient({
                        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                            init.getMongoServiceProps()['mongoDBServicePort']
                    });

                    try {
                        console.info('PUT(' + mongoClient.url.href + uri +')');

                        mongoClient.put(uri, body, function(err, req, res, obj) {
                            callback(err);
                        });
                    }
                    catch (err) {
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

var logVmStatus = function(exercise, id, event, done) {

    console.log('Executing: logVmStatus');
    console.log('Dequeueing - logVmStatus for processing of Event: ', event.name);

    async.waterfall([

            function(callback) {

                // Create the URI for the endpoint
                var uri = '/SystemConfig/midtier.Exercises/' + id;

                // Call GDL using restify method
                console.log('calling GDL: ' + uri );

                var mongoClient = restify.createJsonClient({
                    url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                        init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                        init.getMongoServiceProps()['mongoDBServicePort']
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
                }
                else {
                    // Just received the current exercise record from the database, if the vmWorkingStatus
                    // property does not exist then create it and add to the exercise obtained from the
                    // returned object from the database.
                    var exercise = obj[0];

                    if ( isEmpty(exercise) ) {
                        console.info( '{"status": "Exercise record for ID is empty: ' + id + '"}');
                    }
                    else {
                        // Check to see if the working status exists otherwise create it and add to the
                        // exercise record.
                        if ( !exercise.vmWorkingStatus ) {
                            var status = new Object();
                            status.status = " ";
                            status.currentStage = " ";
                            status.endStage = " ";
                            status.percentComplete = " ";
                            status.statusDescription = " ";
                            exercise.vmWorkingStatus = status;
                        }

                        // Delete the _id field from the object, this cannot be in the data to perform a PUT
                        if ( exercise._id ) {
                            delete exercise._id;
                        }

                        // Get JSON object from event
                        var eventObj = JSON.parse(event.data);

                        switch(event.name) {
                            case 'progressStage':
                                exercise.vmWorkingStatus.status = eventObj[0].status;
                                exercise.vmWorkingStatus.currentStage = eventObj[0].currentStage;
                                exercise.vmWorkingStatus.endStage = eventObj[0].endStage;
                                break;

                            case 'progress':
                                exercise.vmWorkingStatus.percentComplete = eventObj[0].progress;
                                break;

                            case 'completed':
                                exercise.vmWorkingStatus.statusDescription = eventObj[0].error;
                                break;

                            case 'apperror':
                                exercise.vmWorkingStatus.statusDescription = eventObj[0].error;
                                break;

                            default:        // Message with no event name, info messages from VMF
                                exercise.vmWorkingStatus.statusDescription = eventObj[0].message;
                        }
                        callback(null, uri, exercise);
                    }
                }
            },
            function(uri, exercise, callback) {
                // Update the database with the current virtual entity creation status from VMF.
                updateExerciseVmStatus(uri, exercise, function() {
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
module.exports.getExercises = getExercises;
module.exports.getExercise = getExercise;
module.exports.postExercise = postExercise;
module.exports.putExercise = putExercise;
module.exports.deleteExercise = deleteExercise;
module.exports.logVmStatus = logVmStatus;
