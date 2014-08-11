/**
 * Created by twatson on 6/24/2014.
 */
// Required modules
var ecsInit = require('../../config/initialization');
var mongoose = require('mongoose');
var restify = require('restify');

// Definition of JSON schema for the virtualMachine
var templatesSchema = mongoose.Schema({
    name: {type: String, match: /^[A-Za-z0-9-]*$/, required: false},
    system: {type: String, match: /^[A-Za-z0-9-]*$/, required: false},
    version: {type: String, required: true},
    description: {type: String, required: false},
    uploadDTG: {type: String, required: false}
});

// getVmTemplates - Returns the list of virtual machine templates from the Virtual
// Management Framework.
var getVmTemplates = function(request, response) {

    console.log('Executing: getVmTemplates');
    console.log("URL (" + request.url + ')');

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/vmTemplates';

    // Creates a JSON client
    var vmfClient = restify.createJsonClient({
        url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
             ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
             ecsInit.getVmServiceProps()['vmServicePort']
    });

    console.info('GET (' + vmfClient.url.href + uri +')');

    vmfClient.get(uri, function(err, req, res, obj) {
        if (err) {
            console.error(err);
            response.send(403, err);
        }
        else {
            response.json(obj);
        }
    });
}

//
// Exported modules
module.exports.getVmTemplates = getVmTemplates;