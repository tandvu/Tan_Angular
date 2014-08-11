// Required modules
var ecsInit = require('../../config/initialization');
var restify = require('restify');

//Defining ENUMs for Logging Level which will use for validation.
var logLevelEnum = 'FATAL ERROR WARNING INFO DEBUG'.split(' ');

var getLogLevelEnum = function() {
	return logLevelEnum;
};

/**
 * Get the base path for the Mongo Request
 *
 * @param exerciseId {String} Unique ID of the Associated Exercise
 * @param collectionName {String} Associated Mongo Collection Name
 * @api private
 */ 
var getBasePath = function(exerciseId, collectionName)
{
	if(!exerciseId || !collectionName)
	{
		// TODO: Better error handling
		return '';
	}
	else
	{
		var appName = ecsInit.getMongoServiceProps()['mongoDBServiceApp'];
		var basePathName = '/' + exerciseId + '/' +  collectionName;
		if(appName.length != 0)
		{
			basePathName = '/' + appName + basePathName;
		}
		
		return basePathName;
	}
};

/**
 * Filter the given collection by the query parameters passed in
 *
 * TODO: Remove when Node Mongo Svc is available. Allows for "query" functionality right now with nm.php
 * 
 * @param data {String} JSON String of Collection Data
 * @param query {Array} Sequence of key/value pairs to filter the results by     
 * @api private
 */ 
var filterResponseBy = function(data, query)
{
	var result = [];
	
	if(data != null && query != null)
	{
		data.forEach(function(element, index, array)
		{
			var match = true;
			
			for(var i=0; i < query.length; i++)
			{
				match = match && (element[query[i].key] == query[i].value);
			}
			
			if(match == true)
			{
				result.push(element);
			}
		});
	}
	
	return result;
}

/**
 * Returns a set of Log Records
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object  
 * @param basePath {String} Path string for Mongo Request   
 * @param query {Array} Sequence of key/value pairs to filter the results by     
 * @api private
 */ 
var getLogEntries = function(request, response, basePath, query) {

	var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
             ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
             ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    mongoClient.get(basePath, function(err, req, res, obj) {
        if(err) {
            console.log('An error occurred:', err);
            response.send(403, err);
        } else {
            // TODO: Update to use query parameters via mid-tier
			response.json(filterResponseBy(obj, query));
        }
    });
}

/**
 * Makes the request to add a Log Record to the MongoDb Collection
 * 
 * @param request {Request} Node request object
 * @param response {Response} Node response object
 * @param basePath {String} Path string for Mongo Request  
 * @api private
 */ 
var postLogEntry = function(request, response, basePath) {	
	var mongoClient = restify.createJsonClient({
            url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                 ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                 ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

	mongoClient.post(basePath, request.body, function(err, req, res, obj) {
		if(err) {
			console.log('An error occurred:', err);
			response.send(403, err);
		} else {
			response.json(obj);
		}
	});
}

exports.getLogLevelEnum = getLogLevelEnum;
exports.getBasePath = getBasePath;
exports.getLogEntries = getLogEntries;
exports.postLogEntry = postLogEntry;