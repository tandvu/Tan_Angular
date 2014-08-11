#!/usr/bin/env node

'use strict';

var cluster = require('cluster');

// read and parse command line configuration information.
var configuration = require('./config/parse')();

function spawnMaster() {
    // spawn #CPU_CORES - 1 workers (to allow for management thread)
    for (var i = 0; i < require('os').cpus().length - 1; i += 1) {
        console.log('Spawned cluster worker with id %d.', cluster.fork().id);
    }

    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died. Restarting...');
        cluster.fork();
    });
}

function spawnWorker() {
    var worker = require('./generic-database-worker');
    worker(configuration);
}

if (require('os').cpus().length > 1 && cluster.isMaster) {
    spawnMaster();
}
else {
    spawnWorker();
}
