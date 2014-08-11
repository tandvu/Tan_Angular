// Required modules
var utils = require('./logUtilities');
var mongoose = require('mongoose');

// Definition of JSON schema for the Data Product Logs collection
var ProcessLoggingSchema = mongoose.Schema({
	_id : {type: String, required: false}, 
	processInstanceId : {type: String, required: true},
	instanceTaskId : {type: String, required: true},
	missionName: {type: String, required: true}, 
	taskName: {type: String, required: true},
	message : {type: String, required: true},
	user : {type: String, required: true},
	time : {type: String, required: false}
});

var ProcessLoggingModel = mongoose.model('ProcessLogging', ProcessLoggingSchema);
var mongoDBProcessLogCollectionName = "midtier.processlog";

/**
 * Returns the set of Process Log Entries for a given Exercise
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var getProcessLogEntriesForExercise = function(request, response) {
	utils.getLogEntries(request, response, 
			utils.getBasePath(request.params.exerciseId, mongoDBProcessLogCollectionName),[]);
}	

/**
 * Returns the set of Process Log Entries for a given Mission
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var getProcessLogEntriesForMission = function(request, response) {
	utils.getLogEntries(request, response, 
			utils.getBasePath(request.params.exerciseId, mongoDBProcessLogCollectionName),
			[{key : "processInstanceId" , value : request.params.processInstanceId}]);
}

/**
 * Adds a Process Log Entry to the MongoDb Collection
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var postProcessLogEntry = function(request, response) {
	var message = new String(request.body['message']);
	
    if ( message.length == 0 ) {
        response.statusCode = 400
	    response.send("Invalid message field, length of field is: " + message.length );
	}
	else {
		// Validate the JSON against the schema
		new ProcessLoggingModel(request.body).validate(function (error) {
				
			if ( error ) {
				console.log("ERROR: ", error); // Error for message Field because its marked as Required.
				response.statusCode = 400;				
				response.send(error);
			}
			else 
			{
				utils.postLogEntry(request, response,
						utils.getBasePath(request.params.exerciseId, mongoDBProcessLogCollectionName));			
			}
		});	
	}
}

//
// Exported modules
module.exports.getProcessLogEntriesForExercise = getProcessLogEntriesForExercise;
module.exports.getProcessLogEntriesForMission = getProcessLogEntriesForMission;
module.exports.postProcessLogEntry = postProcessLogEntry;