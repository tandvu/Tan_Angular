#!/usr/bin/env node

'use strict';

var cluster = require('cluster');

// read and parse command line configuration information.
var configuration = require('./config/parse');

var worker = require('./environmentConfigWorker');
worker(configuration);
