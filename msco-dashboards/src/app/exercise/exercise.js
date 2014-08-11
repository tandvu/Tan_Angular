angular.module('ngBoilerplate.exercise', [
    'ui.router',
    'exercise.svc',
    'ngTable',
    'ngBoilerplate.dashboard'
])

    .config(function config($stateProvider) {
        $stateProvider.state('exercise', {
            url: '/exercise',
            controller: 'ExerciseResourceCtrl',
            templateUrl: 'exercise/exercise.tpl.html',
            data: {
                pageTitle: 'Exercise',
                displayName: 'Exercise'
            }
        });
    })

    .controller('ExerciseResourceCtrl',
    function ExerciseController($scope, GetExerciseService, ngTableParams, $filter, $q) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        promise.then(GetExerciseService.query(function (exerciseData) {
                var data = exerciseData;  //The name has to be "data" so ngTable would work
                var dataObject = JSON.stringify(data);

                /* jshint -W055 */ // XXX: ngTableParams.  This need to be here or grunt will complain about ngTableParams
                $scope.tableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 10,          // count per page
                    sorting: {
                        name: 'asc'     // initial sorting
                    }
                }, {
                    total: data.length, // length of data
                    getData: function ($defer, params) {
                        // use build-in angular filter
                        var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) : data;

                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            })
        ) //promise.then
        ;
    })


    //Get list of Process Instances for an Exercise
    //Filter out Process Instances that have Stop Time (= inactive)
    //For each Process Instance, look for associated Mission and build the list of Active mission from there
    .controller('MissionCtrl',
    function MissionController($scope, GetProcessInstanceService, GetMissionService, $q, $timeout) {
        $scope.activeMissions = [];
        GetProcessInstanceService.query({'exerciseName': $scope.exercise.name}).$promise.then(
            function (processInstances) {
                $scope.processInstances = processInstances;
                $scope.processInstances.sort(comp);
                if ($scope.processInstances.length > 0) {
                    $scope.startTime = new Date($scope.processInstances[0].startTime);
                    var endTime = new Date().getTime();
                    $scope.totalTime = secondsToString(endTime - $scope.startTime);
                } else {
                    $scope.startTime = null;
                    $scope.totalTime = null;
                }

                return GetMissionService.query({'exerciseName': $scope.exercise.name}).$promise;
            })
            .then(function (missionData) {
                if ($scope.processInstances == null || $scope.processInstances.length <= 0) {
                    return;
                }

                var activeProcessInstances = $scope.processInstances.filter(hasStopTime);
                var missionsTmp = missionData;

                for (var index in activeProcessInstances) {
                    var missionId = activeProcessInstances[index].missionId;

                    for (var i in missionsTmp) {
                        if (missionId == missionsTmp[i]._id) {
                            $scope.activeMissions.push(missionsTmp[i]);
                        }
                    }
                }
            });

        //Filter out ones that do not have stop time
        function hasStopTime(value, index, ar) {
            if (value.stopTime) {
                return false;
            }
            return true;
        }


        //Comp for startTime (earliest time first)
        function comp(a, b) {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }

        function secondsToString(milliseconds) {
            var seconds = milliseconds / 1000;
            var numyears = Math.floor(seconds / 31536000);
            var numdays = Math.floor((seconds % 31536000) / 86400);
            var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
            var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
            var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;

            var duration = '';
            if (numyears > 0) {
                duration += numyears + 'y ';
            }

            if (numdays > 0) {
                duration += numdays + 'd ';
            }
            return duration + numhours + "h " + numminutes + "m";
        }
    }
)
;


