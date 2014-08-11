// Required modules
var utils = require('./logUtilities');
var mongoose = require('mongoose');

// Definition of JSON schema for the Data Product Logs collection
var ErrorLoggingSchema = mongoose.Schema({
	_id : {type: String, required: false},
	level : {type: String, enum: utils.getLogLevelEnum(), required: true},
	message : {type: String, required: true},
	time : {type: String, required: false}
});

var ErrorLoggingModel = mongoose.model('ErrorLogging', ErrorLoggingSchema);
var mongoDBErrorLogCollectionName = "midtier.errorlog";

/**
 * Returns the set of Error Log Entries for a given Exercise
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */
var getErrorLogEntriesForExercise = function(request, response) {
	utils.getLogEntries(request, response, 
			utils.getBasePath(request.params.exerciseId, mongoDBErrorLogCollectionName),[]);
}	

/**
 * Adds an Error Log Entry to the MongoDb Collection
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var postErrorLogEntry = function(request, response) {
	var message = new String(request.body['message']);
	
    if ( message.length == 0 ) {
        response.statusCode = 400
	    response.send("Invalid message field, length of field is: " + message.length );
	}
	else {
		// Validate the JSON against the schema
		new ErrorLoggingModel(request.body).validate(function (error) {
				
			if ( error ) {
				console.log("ERROR: ", error); // Error for message Field because its marked as Required.
				response.statusCode = 400;				
				response.send(error);
			}
			else 
			{
				utils.postLogEntry(request, response,
						utils.getBasePath(request.params.exerciseId, mongoDBErrorLogCollectionName));			
			}
		});	
	}
}

//
// Exported modules
module.exports.getErrorLogEntriesForExercise = getErrorLogEntriesForExercise;
module.exports.postErrorLogEntry = postErrorLogEntry;