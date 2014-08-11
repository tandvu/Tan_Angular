'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports.DatabaseAccess = (function () {

    // Singleton Implementation
    var _modelInstance = null;

    var _defaultAccessEnum = ['manage', 'read'];

    return function (options) {

        if (typeof options === 'undefined') {
            options = {
                accessEnum: _defaultAccessEnum
            };
        } else {
            if (_modelInstance) {
                throw new mongoose.Error.OverwriteModelError('DatabaseAccess');
            }
        }

        if (_modelInstance) {
            return _modelInstance;
        }

        var accessEnum = 'access' in options ? options.access : _defaultAccessEnum;

        var DatabaseAccessSchema = new Schema({
            name: {
                type: String,
                required: true
            },
            access: {
                type: String,
                required: true,
                enum: accessEnum
            }
        });

        _modelInstance = mongoose.model('DatabaseAccess', DatabaseAccessSchema);

        return _modelInstance;
    };
})();

module.exports.Role = (function () {
    var RoleSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        databases: [{
            type: Schema.Types.ObjectId,
            ref: 'DatabaseAccess'
        }]
    });

    RoleSchema.methods.getDatabaseAccess = function (callback) {
        this.populate('databases', function (err, role) {
            if (err) {
                return callback(err);
            }

            callback(null, role);
        });
    };

    return mongoose.model('Role', RoleSchema);
})();

module.exports.Consumer = (function () {

    // Singleton Implementation
    var _modelInstance = null;

    return function (options) {

        if (typeof options === 'undefined') {
            options = {
                credentials: Schema.Types.Mixed
            };
        } else {
            if (_modelInstance) {
                throw new mongoose.Error.OverwriteModelError('Consumer');
            }
        }

        if (_modelInstance) {
            return _modelInstance;
        }

        var CredentialsSchema = 'credentials' in options ? options.credentials : Schema.Types.Mixed;

        var ConsumerSchema = new Schema({
            identifier: {
                type: String,
                required: true
            },
            credentials: CredentialsSchema,
            roles: [{
                type: Schema.Types.ObjectId,
                ref: 'Role'
            }]
        });

        ConsumerSchema.methods.getRoles = function (callback) {
            this.populate('roles', function (err, consumer) {
                if (err) {
                    callback(err);
                } else {
                    consumer.populate({
                        path: 'roles.databases',
                        model: 'DatabaseAccess'
                    }, function (err, consumer) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, consumer.roles);
                        }
                    });
                }
            });
        };

        ConsumerSchema.methods.getDatabaseAccess = function (databaseName, callback) {
            this.getRoles(function (err, roles) {
                var databaseAccess = [];
                for (var i = 0; i < roles.length; i++) {
                    for (var j = 0; j < roles[i].databases.length; j++) {
                        if (roles[i].databases[j].name === databaseName) {
                            databaseAccess.push(roles[i].databases[j]);
                        }
                    }
                }

                callback(null, databaseAccess);
            });
        };

        _modelInstance = mongoose.model('Consumer', ConsumerSchema);

        return _modelInstance;
    };
})();