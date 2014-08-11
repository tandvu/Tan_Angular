'use strict';

var commander	= require('commander'),
	fs 			= require('fs');

function parseCommandLine() {
	commander
	    .version(require('../package.json').version)
	    .option('-p, --port [port number]', 'interface port to open [8080]', 8081)
	    .option('-k, --key [key file]', 'PEM public key to utilize for encryption.')
	    .parse(process.argv);

	// Base configuration values
	var configuration = {
		port: commander.port,
		key: commander.key
	};

	return configuration
}

module.exports = parseCommandLine();