// Required modules
var utils = require('./logUtilities');
var mongoose = require('mongoose');

// Definition of JSON schema for the Data Product Logs collection
var DataProductsLoggingSchema = mongoose.Schema({
	_id : {type: String, required: false}, 
	processInstanceId : {type: String, required: true},
	instanceTaskId : {type: String, required: true},
	prevTaskIds : [{type: String, required: false}],
	missionName: {type: String, required: true}, 
	taskName: {type: String, required: true}, 
	productName : {type: String, required: true},
	productDescription : {type: String, required: false},
	path : {type: String, required: true}, 
	fileSizeBytes : {type: String, required: true},
	user : {type: String, required: true},
	time : {type: String, required: false}
});

var DataProductsLoggingModel = mongoose.model('DataProductLogging', DataProductsLoggingSchema);
var mongoDBDataProductLogCollectionName = "midtier.dataproductlog";

/**
 * Returns the set of Data Product Log Entries for a given Exercise
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var getDataProductLogEntriesForExercise = function(request, response) {
	utils.getLogEntries(request, response, 
			utils.getBasePath(request.params.exerciseId, mongoDBDataProductLogCollectionName),[]);
}

/**
 * Returns the set of Data Product Log Entries for a given Mission
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var getDataProductLogEntriesForMission = function(request, response) {
	utils.getLogEntries(request, response, 
			utils.getBasePath(request.params.exerciseId, mongoDBDataProductLogCollectionName),
			[{key : "processInstanceId" , value : request.params.processInstanceId}]);
}

/**
 * Adds a Data Product Log Entry to the MongoDb Collection
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object    
 * @api private
 */ 
var postDataProductLogEntry = function(request, response) {
	var name = new String(request.body['name']);
	
    if ( name.length == 0 ) {
        response.statusCode = 400
	    response.send("Invalid name field, length of field is: " + name.length );
	}
	else {
		// Validate the JSON against the schema
		new DataProductsLoggingModel(request.body).validate(function (error) {
				
			if ( error ) {
				console.log("ERROR: ", error); // Error for Name Field because its marked as Required.
				response.statusCode = 400;				
				response.send(error);
			}
			else 
			{
				utils.postLogEntry(request, response,
						utils.getBasePath(request.params.exerciseId, mongoDBDataProductLogCollectionName));			
			}
		});	
	}
}

//
// Exported modules
module.exports.getDataProductLogEntriesForExercise = getDataProductLogEntriesForExercise;
module.exports.getDataProductLogEntriesForMission = getDataProductLogEntriesForMission;
module.exports.postDataProductLogEntry = postDataProductLogEntry;