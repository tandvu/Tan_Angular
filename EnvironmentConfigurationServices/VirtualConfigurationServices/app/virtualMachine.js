/**
 * Created by twatson on 6/24/2014.
 */
// Required modules
var async = require('async');
var seqqueue = require('seq-queue');
var ecsInit = require('../../config/initialization');
var mongoose = require('mongoose');
var restify = require('restify');
var ssEvent = require('./ssEvent');
var vmEventStatus = require('./exerciseVirtualSystems');
var querystring = require("querystring");
var url         = require('url');


// Definition of JSON schema for the virtualMachine
var virtualMachineSchema = mongoose.Schema({
    uid: {type: String, required: true},
    name: {type: String, match: /^[A-Za-z0-9-]*$/, required: true},
    computerName: {type: String, match: /^[A-Za-z0-9-]*$/, required: true},
    cpu: {type: String, required: true},
    memory: {type: String, required: false},
    runningStatus: {type: String, required: false},
    hardDisks: [{
        diskName : {type: String, required: true},
        diskSize : {type: String, required: true},
        diskBusType : {type: String, required: true}
    }],
    networks: [{
        cardIndex : {type: String, required: true},
        ip : {type: String, required: true},
        mac : {type: String, required: true},
        mode : {type: String, required: true}
    }]
});

var VirtualMachineModel =
    mongoose.model('VirtualMachine', virtualMachineSchema);

// Defining ENUMs for the exercise state field which will use for validation.
var importStatusState = 'IMPORTED NOT_IMPORTED'.split(' ');

// Definition of JSON schema for the TemplateStatus collection
var templateStatusSchema = mongoose.Schema({
    _id: {type: String, required: false},
    templateName: {type: String, required: true},
    importStatus: {type: String, enum: importStatusState, required: true},
    workingStatus: {
        status : {type: String, required: false},
        currentStage: {type: String, required: false},
        endStage: {type: String, required: false},
        percentComplete : {type: String, required: false},
        statusDescription : {type: String, required: false}
    },
    time: {type: String, required: false}
});

var TemplateStatusModel =
    mongoose.model('TemplateStatus', templateStatusSchema);


// getVirtualMachine - Returns the virtual machine status information in JSON identified by
// the unique identifier specified from the Virtual Management Framework.
var getVirtualMachine = function(request, response) {

    console.log('Executing: getVirtualMachine');
    console.log("URL (" + request.url + ')');

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/virtualMachines/' + request.params.uid;

    vmGetRequest(request, response, uri);
}

// getSaveVmAsTemplate - Notifies the Virtual Management Framework to save the virtual
// machine identified by the unique identifier as a template in vCloud.
var getSaveVmAsTemplate = function(request, response) {

    console.log('Executing: getSaveVmAsTemplate');
    console.log("URL (" + request.url + ')');

    // First do a put into the database for a entry in the template status table, mark as
    // Unique, that way the update will fail if a rename has already been done with the
    // same name. Then use this resource ID to log status.

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus/templateName';

    console.info('POST(' + mongoClient.url.href + uri +')');

    // Create a empty record in the
    var tmpl = {
        templateName: request.params.newTemplateName,
        importStatus: "NOT_IMPORTED",
        workingStatus: {
            status: "",
            currentStage: "",
            endStage: "",
            percentComplete: "",
            statusDescription: ""
        }
    };

    // Validate the JSON against the schema
    new TemplateStatusModel(tmpl).validate(function (error) {
        if (error) {
            console.error(error);
            response.send(403, error);
        } else {
            mongoClient.post(uri, tmpl, function(err, req, res, obj) {
                if(err) {
                    console.error(err);
                    response.send(403, err);
                } else {
                    saveAsTemplate(request, response, obj);
                }
            });
        }
    });
}

// saveAsTemplate - Notifies the Virtual Management Framework to save the virtual
// machine identified by the unique identifier as a template in vCloud.
var saveAsTemplate = function(request, response, template) {

    console.log('Executing: saveAsTemplate');
    console.log("URL (" + request.url + ')');

    var queue = seqqueue.createQueue(1000);
    var templateStatus = template[0];
    var id = templateStatus._id;

    // Delete the _id field from the object, this cannot be in the data to perform a PUT
    if ( templateStatus._id ) {
        delete templateStatus._id;
    }

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/saveVmAsTemplate/' + request.params.uid +
        '/' + request.params.newTemplateName;


    // Get the query parameters and set the uri string with them
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var result = querystring.stringify(query);
    if (result) {
        uri = uri + '?' + result;
    }

    // Creates a JSON client
    var vmfClient = restify.createClient({
        url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
            ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
            ecsInit.getVmServiceProps()['vmServicePort']
    });

    // Set the response header for the SSE
    ssEvent.setHeader(response);

    console.info('GET (' + vmfClient.url.href + uri +')');

    vmfClient.get(uri, function(err, req, res, obj) {

        req.on('result', function(err, res) {

            res.on('data', function(rawData) {

                var chunk = rawData.toString();
                var event = ssEvent.getEvent(chunk);

                // The event has to be queued to ensure database writes occur in sequence by waiting
                // for each asynchronous call to complete otherwise the DEPLOYED flag may get cleared
                // by out of sequence DB writes.
                queue.push(
                    function(task) {
                        // Log status in database
                        logTemplateStatus(request, request.params.exercise, id, templateStatus, event, function () {
                            console.log('Event completed: ', event.name);
                            task.done();   // Tell the queue that we are done with this task
                        }, 2000)
                    }
                );

                // Go ahead and forward event to the client
                ssEvent.sendEvent(response, event);
            });

            res.on('end', function() {
                console.info("\nReceived end event");
                response.end();
            });
        });
    });
}

var logTemplateStatus = function(request, exercise, id, templateStatus, event, done) {

    console.log('Executing: logTemplateStatus');
    console.log('Dequeueing - logTemplateStatus for processing of Event: ', event.name);

    async.waterfall([

        function(callback) {
            var eventObj = JSON.parse(event.data);
            switch(event.name) {
                case 'progressStage':
                    templateStatus.importStatus = "NOT_IMPORTED";
                    templateStatus.workingStatus.status = eventObj[0].status;
                    templateStatus.workingStatus.currentStage = eventObj[0].currentStage;
                    templateStatus.workingStatus.endStage = eventObj[0].endStage;
                    break;
                case 'progress':
                    templateStatus.importStatus = "NOT_IMPORTED";
                    templateStatus.workingStatus.percentComplete =eventObj[0].progress;
                    break;
                case 'completed':
                    templateStatus.importStatus = "IMPORTED";
                    templateStatus.workingStatus.statusDescription = eventObj[0].message;
                    break;
                case 'apperror':
                    templateStatus.importStatus = "NOT_IMPORTED";
                    templateStatus.workingStatus.statusDescription = eventObj[0].error;

                    // Clean up the entry in the database
                    deleteLogStatus(request, id, templateStatus);

                    break;
                default:        // Message with no event name, info messages from VMF
                    templateStatus.importStatus = "NOT_IMPORTED";
                    templateStatus.workingStatus.statusDescription = eventObj[0].message;
            }
            callback(null);
        },
        function(callback) {
            new TemplateStatusModel(templateStatus).validate(function (error) {
                callback(null, error);
            });
        },
        function(error, callback) {
            if ( error ) {
                callback(error);
            }
            else {
                var uri = '/' + exercise + '/midtier.TemplateStatus/' + id;

                var mongoClient = restify.createJsonClient({
                    url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
                        ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
                        ecsInit.getMongoServiceProps()['mongoDBServicePort']
                });
                try {

                    console.info('PUT(' + mongoClient.url.href + uri +')');

                    mongoClient.put(uri, templateStatus, function(err, req, res, obj) {
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
                console.log('Successfully updated database record: \n', templateStatus);
            }
            done(null);
        }
    );
}

// deleteLogStatus - Deletes the record identified by the resource id.
var deleteLogStatus = function(request, id, templateStatus) {

    console.log('Executing: deleteLogStatus');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus/' + id;

    console.info('DEL(' + mongoClient.url.href + uri +')');

    mongoClient.del(uri, function(err, req, res) {
        if(err) {
            console.error(err);
        } else {
            console.info('record ', id, ' deleted')
        }
    });
}

// provisionVm - Provisions the specified virtual machine from the specified template in
// the Virtual Management Framework.
var provisionVm = function(request, response, exerciseVm) {

    console.log('Executing: provisionVm');
    console.log("URL (" + request.url + ')');

    var queue = seqqueue.createQueue(1000);
    var vlansString = "vlans=";

    // Create the vlans string from the data in the database record
    if ( exerciseVm.vlans ) {

        var str = "";

        for ( index in exerciseVm.vlans ) {
            if ( str == "" ) {
                str = exerciseVm.vlans[index].type;
            }
            else {
                str = str + ',' + exerciseVm.vlans[index].type;
            }
        }
        vlansString = vlansString + str;
    }

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/provisionVm/' + request.params.exercise + '/' +
        exerciseVm.templateName + '/' + exerciseVm.name + '/' + vlansString;

    // Creates a JSON client
    var vmfClient = restify.createClient({
        url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
            ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
            ecsInit.getVmServiceProps()['vmServicePort']
    });

    // Set the response header for the SSE
    ssEvent.setHeader(response);

    console.info('GET (' + vmfClient.url.href + uri +')');

    vmfClient.get(uri, function(err, req, res, obj) {

        req.on('result', function(err, res) {

            res.on('data', function(rawData) {

                var chunk = rawData.toString();
                var event = ssEvent.getEvent(chunk);

                // The event has to be queued to ensure database writes occur in sequence by waiting
                // for each asynchronous call to complete otherwise the DEPLOYED flag may get cleared
                // by out of sequence DB writes.
                queue.push(
                    function(task) {

                        // Log provisioning status in ExerciseVirtualSystems
                        // collection database
                        vmEventStatus.logEventStatus(request, response, event, function () {
                            console.info('Event completed: ', event.name);
                            task.done();   // Tell the queue that we are done with this task
                        }, 2000)
                    }
                );

                // Go ahead and forward event to the client
                ssEvent.sendEvent(response, event);
            });

            res.on('end', function() {
                console.info("\nReceived end event");
                response.end();
            });
        });
    });
}

// getProvisionVm - Checks to see if a virtual machine has been provisioned or not and if not, initiates
// the provisioning of a VM.
var getProvisionVm = function(request, response) {

    console.log('Executing: getProvisionVm');
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

            // Check to see if the VM has been deployed or not
            var exerciseVm = obj[0];

            if ( isEmpty(exerciseVm) ) {
                console.info("Exercise Virtual System record for ID is empty: " + request.params.id );
                response.send(400, '{"status": "Exercise Virtual System record for ID is empty: ' +
                    request.params.id + '"}');
            }
            else {
                if (exerciseVm.deploymentStatus == 'NOT_DEPLOYED') {
                    provisionVm(request, response, exerciseVm);
                }
                else {
                    response.send(400, '{"status": "Virtual Machine has already been deployed"}');
                }
            }
        }
    });
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// putStartVm - Starts up the virtual machine identified by the unique identifier
// specified from the Virtual Management Framework.
var putStartVm = function(request, response) {

    console.log("Executing: putStartVm");

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/startVm/' + request.params.uid;

    vmPutRequest(request, response, uri);
}

// putStopVm - Stops the virtual machine identified by the unique identifier
// specified from the Virtual Management Framework.
var putStopVm = function(request, response) {

    console.log("Executing: putStopVm");

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/stopVm/' + request.params.uid;

    vmPutRequest(request, response, uri);
}

// putSuspendVm - Suspends the virtual machine identified by the unique identifier
// specified from the Virtual Management Framework.
var putSuspendVm = function(request, response) {

    console.log("Executing: putSuspendVm");

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/suspendVm/' + request.params.uid;

    vmPutRequest(request, response, uri);
}

// vmGetRequest - Generic request to make a GET REST call to the VMF server and respond to
// the requesting client.
var vmGetRequest = function(request, response, uri) {

    console.log('Executing: vmGetRequest');
    console.log("URL (" + request.url + ')');

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
            response.send(400, err);
        }
        else {
            response.json(obj);
        }
    });
}

var vmPutRequest = function(request, response, uri) {

    console.log('Executing: vmPutRequest');
    console.log("URL (" + request.url + ')');

    // Creates a JSON client
    var vmfClient = restify.createJsonClient({
        url: ecsInit.getVmServiceProps()['vmServiceProto'] + '://' +
            ecsInit.getVmServiceProps()['vmServiceAddr'] + ':' +
            ecsInit.getVmServiceProps()['vmServicePort']
    });

    console.info('PUT (' + vmfClient.url.href + uri +')');

    vmfClient.put(uri, request.body, function (err, req, res, obj) {
        if (err) {
            console.error(err);
            response.send(400, err);
        }
        else {
            response.json(obj);
        }
    });
}

// Template Modules

// getTemplateStatuses - Returns the list of template statuses
// from the Template Status collection.
var getTemplateStatuses = function(request, response) {

    console.log('Executing: getTemplateStatuses');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus';

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

// getTemplateStatus - Returns the template status record identified
// by the resource id.
var getTemplateStatus = function(request, response) {

    console.log('Executing: getTemplateStatus');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' + init.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + 'TemplateStatus/' + request.params.id;

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

// postTemplateStatus - Creates new record in the template
// status collection with using the json passed in the body.
var postTemplateStatus = function(request, response) {

    console.log('Executing: postTemplateStatus');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus/templateName';

    console.info('POST(' + mongoClient.url.href + uri +')');

    // Validate the JSON against the schema
    new TemplateStatusModel(request.body).validate(function (error) {
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

// putTemplateStatus - Updates the json fields of the record
// identified by the resource id.
var putTemplateStatus = function(request, response) {

    console.log('Executing: putTemplateStatus');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus/' + request.params.id;

    console.info('PUT(' + mongoClient.url.href + uri +')');

    // Validate the JSON against the schema
    new TemplateStatusModel(request.body).validate(function (error) {
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

// deleteTemplateStatus - Deletes the record identified by the resource id.
var deleteTemplateStatus = function(request, response) {

    console.log('Executing: deleteTemplateStatus');
    console.log("URL (" + request.url + ')');

    var mongoClient = restify.createJsonClient({
        url: ecsInit.getMongoServiceProps()['mongoDBServiceProto'] + '://' +
            ecsInit.getMongoServiceProps()['mongoDBServiceAddr'] + ':' +
            ecsInit.getMongoServiceProps()['mongoDBServicePort']
    });

    var uri = '/' + request.params.exercise + '/midtier.TemplateStatus/' + request.params.id;

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

//
// Exported modules
module.exports.getVirtualMachine = getVirtualMachine;
module.exports.getSaveVmAsTemplate = getSaveVmAsTemplate;
module.exports.getProvisionVm = getProvisionVm;
module.exports.putStopVm = putStopVm;
module.exports.putStartVm = putStartVm;
module.exports.putSuspendVm = putSuspendVm;
module.exports.getTemplateStatuses = getTemplateStatuses;
module.exports.getTemplateStatus = getTemplateStatus;
module.exports.postTemplateStatus = postTemplateStatus;
module.exports.putTemplateStatus = putTemplateStatus;
module.exports.deleteTemplateStatus = deleteTemplateStatus;
