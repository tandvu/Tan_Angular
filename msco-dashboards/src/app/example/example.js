var app = angular.module('ngBoilerplate.example', ['ngTable'])

    .config(function config($stateProvider) {
        $stateProvider.state('example', {
            url: '/example',
            views: {
                "main": {
                    controller: 'MainCtrl as main',
                    templateUrl: 'example/example.tpl.html'
                }
            },
            data: {
                pageTitle: 'Example',
                displayName: 'Example'
            }
        });
    })

    .controller('MainCtrl', function ($window, $scope) {
        $scope.data = [
            {name: "Moroni", age: 50},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34}
        ];
        $scope.items = [+new $window.Date()];

        this.push = function () {
            $scope.items.push(+new $window.Date());
        };

        this.pop = function () {
            $scope.items.pop();
        };

        this.moveLast = function () {
            $scope.items.splice(+new $window.Date() % ($scope.items.length - 1), 0, $scope.items.splice($scope.items.length - 1, 1)[0]);
        };
    })

    .controller('ExampleCtrl', function ($scope, ngTableParams) {

        var data = [
            {name: "Moroni", age: 50},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34},
            {name: "Tiancum", age: 43},
            {name: "Jacob", age: 27},
            {name: "Nephi", age: 29},
            {name: "Enos", age: 34}
        ];

        /* jshint -W055 */ // XXX: ngTableParams.
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: data.length, // length of data
            getData: function ($defer, params) {
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
    });