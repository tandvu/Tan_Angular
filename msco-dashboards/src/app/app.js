angular.module('ngBoilerplate', [
    'templates-app',
    'templates-common',
    'ui.router' ,
    'ui.bootstrap',
    'truncate',
    'ngBoilerplate.dashboard',
    'ngBoilerplate.exercise',
    'ngBoilerplate.example',
    'overview.vm'
])

    .config(function myAppConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/exercise'); //comment this line out and uncoment $state.go('home') below would give the same effect
//        $locationProvider.html5Mode(true);
    })

    .run(function run() {
    })

    .controller('AppCtrl', function AppCtrl($scope, $location, $state, $http) {
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (angular.isDefined(toState.data.pageTitle)) {
                $scope.pageTitle = 'MSCO | ' + toState.data.pageTitle;
            }
        });

        var exercise = {
            "name": "change.me.to.exercise.name",
            "poc": "Mr. James Boerke",
            "role": "Planner",
            "description": "Planner",
            "state": "Running",
            "filepath": "/my/path"
        };

//        $http.get("/Exercises").success(function(data) {
//            alert("app.js.$http.get.sucess");
//        });

/*        $http.get("http://msco-cf-web-dev/ecs/Exercises").success(function (data, status, headers, config) {
            alert("sucess");
            $scope.hello = data;
        })
            .error(function (data, status, headers, config) {
                alert("error");
            });*/



//        $state.go('home');
    })



    .controller('PostDataCtrl', function AppCtrl($scope, $http, transformRequestAsFormPost) {
        alert('PostDataCtrl');
        // I hold the data-dump of the FORM scope from the server-side.
        $scope.cfdump = "";

        // By default, the $http service will transform the outgoing request by
        // serializing the data as JSON and then posting it with the content-
        // type, "application/json". When we want to post the value as a FORM
        // post, we need to change the serialization algorithm and post the data
        // with the content-type, "application/x-www-form-urlencoded".
        var request = $http({
            method: "POST",
            url: "http://msco-cf-web-dev/ecs/Exercises",
            transformRequest: transformRequestAsFormPost,
            data: {
                "_collectiondata": [
                    {
                        _id: "53a069f14d20240000b2f543",
                        name: "myExercise1",
                        poc: "Jared Ladner",
                        description: "Planner",
                        role: "Planner",
                        state: "Running",
                        filepath: "/my/path",
                        time: "2014-06-17 11:16:49"
                    },
                    {
                        _id: "53a06b369f26a0000030a5a8",
                        name: "exercise2",
                        poc: "Jared Ladner",
                        description: "Planner",
                        role: "Planner",
                        state: "Running",
                        filepath: "/my/path",
                        time: "2014-06-17 11:22:14"
                    }
                ]
            }
        });


        // Store the data-dump of the FORM scope.
        request.success(
            function (html) {
                $scope.cfdump = html;
            }
        );
    })
;