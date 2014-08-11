// Required modules
var express = require('express');
var fs = require('fs');
var routes = require('../app/routes');

// Property attributes
var mongoDBServiceProps;	
var vmServiceProps;
var jBPMServiceProps;

var initialize = function(app, configuration) {    
    initApp(app);   
    initProperties(app, configuration);    
	routes.initRoutes(app);
}

var initApp = function(app) {
    app.use(express.json());
    app.use(express.urlencoded());
}

var initProperties = function(app, configuration) {

    fs.readFile("./properties/config.json", 'utf8', function (err, data) {		
        if (err) {
            console.log('Error Reading Properties File: ' + err);
			throw err;
        } else { 
    	    prop = JSON.parse(data);
            // MongoDB REST Service Properties				
     	 	mongoDBServiceProps = prop['mongoDBService'];	
            vmServiceProps = prop['vmService'];

            jBPMServiceProps = prop['jBPMService'];     
            if (configuration.key) {
                jBPMServiceProps.privateKey = configuration.key;
            }
			
			console.log(data);
        }			
    });
}

// Property Get methods
var getMongoServiceProps = function() {
   return mongoDBServiceProps;
}

var getVmServiceProps = function() {
   return vmServiceProps;
}

var getJBPMServiceProps = function() {
   return jBPMServiceProps;
}

//
// Exported modules and data
module.exports.initialize = initialize;
module.exports.getJBPMServiceProps = getJBPMServiceProps;
module.exports.getMongoServiceProps = getMongoServiceProps;
module.exports.getVmServiceProps = getVmServiceProps;
