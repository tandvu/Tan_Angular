// Required modules
var init = require('../config/initialization');
var mongoose = require('mongoose');
var restify = require('restify');

// Defining ENUMs for the virtual lan type which will use for validation.
var virtualLanType = 'App Db Dis Org'.split(' ');

// Definition of JSON schema for the VirtualLanConfigurations collection
var VirtualLanConfigurationsSchema = mongoose.Schema({
    _id: {type: String, required: false}, 
    name: {type: String, required: true}, 
    type: {type: String, enum: virtualLanType, required: true}, 
    time: {type: String, required: false} 
});

var VirtualLanConfigurationsModel = 
    mongoose.model('VirtualLanConfigurations', VirtualLanConfigurationsSchema);

// getVirtualLanConfigurations - Returns the list of virtual LAN 
// configurations from the virtual LAN configurations collection.
var getVirtualLanConfigurations = function(request, response) {

    console.log('Executing: getVirtualLanConfigurations');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/SystemConfig/midtier.VirtualLans';

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

// getVirtualLanConfiguration - Returns the virtual LAN configuration
// record identified by the resource id.
var getVirtualLanConfiguration = function(request, response) {

    console.log('Executing: getVirtualLanConfiguration');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/SystemConfig/midtier.VirtualLans/' + request.params.id;

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

// postVirtualLanConfiguration - Creates new record in the 
// virtual LAN configuration collection with using the json passed
// in the body.
var postVirtualLanConfiguration = function(request, response) {

    console.log('Executing: postVirtualLanConfiguration');
    console.log("URL (" + request.url + ')');

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

        var uri = '/SystemConfig/midtier.VirtualLans/';

        console.info('POST(' + mongoClient.url.href + uri +')');

        // Validate the JSON against the schema
        new VirtualLanConfigurationsModel(request.body).validate(function (error) {
            if (error) {
                console.error(error);
                response.send(403, error);
            } else {
                mongoClient.post(uri, request.body, function (err, req, res, obj) {
                    if (err) {
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

// putExercise - Updates the json fields of the record identified 
// by the resource id.
var putVirtualLanConfiguration = function(request, response) {

    console.log('Executing: putVirtualLanConfiguration');
    console.log("URL (" + request.url + ')');

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

        var uri = '/SystemConfig/midtier.VirtualLans/' + request.params.id;

        console.info('PUT(' + mongoClient.url.href + uri +')');

        // Validate the JSON against the schema
        new VirtualLanConfigurationsModel(request.body).validate(function (error) {
            if (error) {
                console.error(error);
                response.send(403, error);
            } else {
                mongoClient.put(uri, request.body, function (err, req, res, obj) {
                    if (err) {
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
var deleteVirtualLanConfiguration = function(request, response) {

    console.log('Executing: deleteVirtualLanConfiguration');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: init.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            init.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/SystemConfig/midtier.VirtualLans/' + request.params.id;

    console.info('DEL(' + mongoClient.url.href + uri +')');

    mongoClient.delete(uri, request.body, function(err, req, res, obj) {
        if(err) {
            console.error(err);
            response.send(403, err);
        } else {
            response.json(obj);
        }

    });
}

//
// Exported modules
module.exports.getVirtualLanConfigurations = getVirtualLanConfigurations;
module.exports.getVirtualLanConfiguration = getVirtualLanConfiguration;
module.exports.postVirtualLanConfiguration = postVirtualLanConfiguration;
module.exports.putVirtualLanConfiguration = putVirtualLanConfiguration;
module.exports.deleteVirtualLanConfiguration = deleteVirtualLanConfiguration;
