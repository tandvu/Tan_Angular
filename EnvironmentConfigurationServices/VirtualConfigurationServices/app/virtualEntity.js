/**
 * Created by twatson on 6/24/2014.
 */
// Required modules
var seqqueue = require('seq-queue');
var ecsInit = require('../../config/initialization');
var mongoose = require('mongoose');
var restify = require('restify');
var exercise = require('../../app/exerciseConfig');
var ssEvent = require('./ssEvent');


// getVirtualEntity - Returns the virtual entity for the specified exercise
var getVirtualEntity = function(request, response) {

    console.log('Executing: getVirtualEntity');
    console.log("URL (" + request.url + ')');

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/virtualEntities/' + request.params.exercise;

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

// createVirtualEntity - Creates the virtual entity bundle in the cloud environment for
// housing the virtual machines.
var createVirtualEntity = function(request, response) {

    console.log('Executing: createVirtualEntity');
    console.log("URL (" + request.url + ')');

    var queue = seqqueue.createQueue(1000);

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/createVirtualEntity/' + request.params.exercise;

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
                        // Log creation of virtual entity status in Exercises collection database
                        exercise.logVmStatus(request.params.exercise, request.params.id, event, function () {
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

// deleteVirtualEntity - Deletes the virtual entity bundle in the cloud environment thats
// houses the virtual machines.
var deleteVirtualEntity = function(request, response) {

    console.log('Executing: deleteVirtualEntity');
    console.log("URL (" + request.url + ')');

    // Create the URI for the endpoint
    var uri = ecsInit.getVmServiceProps()['vmServiceURI'] + '/deleteVirtualEntities/' + request.params.exercise;

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

                // Go ahead and send event to client
                ssEvent.sendEvent(response, event);
            });

            res.on('end', function() {
                console.info("\nReceived end event");
                response.end();
            });
        });
    });
}

//
// Exported modules
module.exports.getVirtualEntity = getVirtualEntity;
module.exports.createVirtualEntity = createVirtualEntity;
module.exports.deleteVirtualEntity = deleteVirtualEntity;

