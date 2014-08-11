'use strict';

var async = require('async'),
	express = require('express'),
	mongoose = require('mongoose');

var MscoConsumer = require('msco-consumer');
var Consumer = MscoConsumer.Consumer();
var Role = MscoConsumer.Role;

MscoConsumer.DatabaseAccess();

module.exports = (function () {

	function requireLogin(req, res, next) {
		if (req.session.passport.user) {
			next();
		} else {
			res.redirect('/');
		}
	}

	//-- Constructor
	return function () {

		var _route = express.Router();

		_route.get('/service/consumer', requireLogin, function (req, res) {
			MscoConsumer.getConsumers(function (err, consumers) {
				if (err) {
					return res.json(400, {
						error: err.message
					});
				}
				res.json(200, consumers);
			});
		});

		_route.post('/service/consumer', requireLogin, function (req, res) {
			if (!req.body || !req.body.name || req.body.name.length === 0) {
				return res.send(400);
			}

			MscoConsumer.findConsumer(req.body.name, function (err, consumer) {
				if (err) {
					return res.send(404);
				}
				if (consumer) {
					return res.json(400, {
						error: 'Consumer exists.'
					});
				}

				new Consumer({
					identifier: req.body.name
				}).save(function (err, consumer) {
					if (err) {
						return res.json(400, {
							error: err.message
						});
					}

					res.json(200, consumer);
				});
			});
		});

		_route.put('/service/consumer/roles', requireLogin, function (req, res) {
			if (!req.body || !req.body.consumer || req.body.consumer.length === 0 || !req.body.roles) {
				return res.send(400);
			}

			MscoConsumer.findConsumer(req.body.consumer, function (err, consumer) {
				if (err) {
					return res.json(400, {
						error: err.message
					});
				}
				if (!consumer) {
					return res.json(404, {
						error: 'Unable to locate consumer.'
					});
				}

				async.map(req.body.roles, function (value, callback) {
						MscoConsumer.findRole(value, callback);
					},
					function (err, roles) {
						if (err) {
							return res.json(400, {
								error: err.message
							});
						}

						consumer.roles = roles;
						consumer.save(function (err, consumer) {
							if (err) {
								return res.json(400, {
									error: err.message
								});
							}

							res.json(200, consumer);
						});
					});

			});
		});

		_route.get('/service/role', requireLogin, function (req, res) {
			MscoConsumer.getRoles(function (err, roles) {
				if (err) {
					return res.json(400, {
						error: err.message
					});
				}
				res.json(200, roles);
			});
		});

		_route.post('/service/role', requireLogin, function (req, res) {
			if (!req.body || !req.body.name || req.body.name.length === 0) {
				return res.send(400);
			}

			new Role({
				name: req.body.name
			}).save(function (err, role) {
				if (err) {
					return res.json(400, {
						error: err.message
					});
				}
				res.json(200, role);
			});

		});

		_route.put('/service/role/databases', requireLogin, function (req, res) {
			if (!req.body || !req.body.role || req.body.role.length === 0 || !req.body.database || req.body.database.length === 0) {
				return res.send(400);
			}

			MscoConsumer.findRole(req.body.role.name, function (err, role) {
				if (err) {
					return res.json(400, {
						error: err.message
					});
				}
				if (!role) {
					return res.json(404, {
						error: 'Unable to locate role.'
					});
				}

				role.getDatabaseAccess(function (err, role) {
					if (err) {
						return res.json(400, {
							error: err.message
						});
					}
					for (var i = 0; i < role.databases.length; i++) {
						console.log(role.databases[i]);
					}
				});

				res.json(200, {});
			});

		});

		_route.get('/service/database', requireLogin, function (req, res) {
			new mongoose.mongo.Admin(mongoose.connection.db).listDatabases(function (err, result) {
				if (err) {
					res.json(400, {
						error: err.message
					});
				}

				res.json(200, result.databases.map(function (value) {
					return value.name;
				}));
			});
		});

		return _route;
	};
})();