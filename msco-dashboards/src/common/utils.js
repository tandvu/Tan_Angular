angular.module('utils', [
    'ngTable'
])

.factory('JsonData', function ($http, utils) {
    var jsonData = function(url, params) {
        var data = $http.get(url, params)
            .then(function (response) {
                return response.data;
            });

        this.all = function () {
            return data;
        };

        this.get = function (id) {
            return data.then(function(a){
                return utils.findById(a, id);
            });
        };

        this.getByKey = function(key, value) {
            return data.then(function(a) {
                return utils.findByKey(a, key, value);
            });
        };
    };

    return jsonData;
})

.factory('utils', function (ngTableParams) {
    function findByKey(a, keyName, value) {
        var keyValue, keyPath = keyName.split(".");

        for (var i = 0; i < a.length; i++) {
            keyValue = a[i];

            for(var k in keyPath) {
                keyValue = keyValue[keyPath[k]];
            }

            if (keyValue == value) {
                return a[i];
            }
        }
        return null;
    }

    function findAllByKey(a, keyName, key) {
        var items = [];

        for (var i = 0; i < a.length; i++) {
            if (a[i][keyName] == key) {
                items.push(a[i]);
            }
        }
        return items;
    }

    return {
        findByKey: findByKey,
        findAllByKey: findAllByKey,
        findById: function findById(a, id) {
            return findByKey(a, '_id', id);
        },
        /**
         * Generate ng-table.
         * @param tableParams - object
         *      table parameters
         * @param tableSettings - object
         *      table settings
         * @returns {*}
         */
        createNgTable: function (tableParams, tableSettings) {
            /* jshint -W055 */
            return new ngTableParams(tableParams, tableSettings);
        }
    };

});