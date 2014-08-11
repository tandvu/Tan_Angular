// Required modules
var express = require('express');
var routes = require('../app/routes');

var initialize = function(app) {    
    initApp(app);	
	routes.initRoutes(app);
}

var initApp = function(app) {
    app.use(express.json());
    app.use(express.urlencoded());
}

//
// Exported modules and data
module.exports.initialize = initialize;
