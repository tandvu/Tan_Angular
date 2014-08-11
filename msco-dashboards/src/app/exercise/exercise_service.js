angular.module('exercise.svc', [
    'ngResource',
    'utils'
])

    .factory('ExerciseService', function(JsonData) {
        function getUsers(path, params) {
            var url = '/ecs/fve/Users/' + path;

            return new JsonData(url, params);
        }

        function getMissions(path, params) {
            var url = '/ecs/fve/Missions/' + path;

            return new JsonData(url, params);
        }

        function getProcessInstances(path, params) {
            var url = '/ecs/fve/ProcessInstances/' + path;

            return new JsonData(url, params);
        }

        function getInstanceTasks(path, params) {
            var url = '/ecs/fve/InstanceTasks/' + path;

            return new JsonData(url, params);
        }

        function getInstanceRoles(path, params) {
            var url = '/ecs/fve/InstanceRoles/' + path;

            return new JsonData(url, params);
        }

        return {
            getUsers: getUsers,
            getMissions: getMissions,
            getProcessInstances: getProcessInstances,
            getInstanceTasks: getInstanceTasks,
            getInstanceRoles: getInstanceRoles
        };
    })

//Return list of Process Instance using ng-resource
    .factory('GetProcessInstanceService', function($resource){
        var path = '/ecs/fve/ProcessInstances/:exerciseName';

        return $resource(path,
            {exerciseName: "@exerciseName"}
        );
    })


//Return list of exercises using ng-resource
    .factory('GetExerciseService', function($resource){
        var path = '/ecs/Exercises';
        return $resource(path);
    })

//Return list of missions for an exercise using ng-resource
    .factory('GetMissionService', function($resource){
        var path = '/ecs/fve/Missions/:exerciseName';

        return $resource(path,
            {exerciseName: "@exerciseName"}
        );
    })


//Return list of missions for an exercise using $http & promise
    .factory('getMissionService', function($http, $q){
        return {
            getMissionList: function(missionName) {
                var deferred = new $q.defer();
//            var missionList =  $http.get('/ecs/fve/Missions/LionStrike');

//            var missionList = $http.get('assets/json_data/' + missionName + 'Missions.json');

                var url = '/ecs/fve/Missions/' + missionName;
                $http.get(url).success(function (resp) {
//                alert("exercise_service: " + missionName);
                    deferred.resolve(resp);
                }).error(function(error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };
    })

//$http with w/o promise
    .factory('getExerciseListService', function($http){
        return {
            getExerciseList: function() {
//            var url = "http://www.json-generator.com/api/json/get/bVlvWtdlSG?indent=2";
                var url = '/ecs/Exercises';
//            var url = 'assets/json_data/trainings.json';
//            var url ='http://www.json-generator.com/api/json/get/cezkzcCMBK?indent=2';

                return $http.get(url);

            }
        };
    })

    .factory('getSystemInfoService', function($routeParams, $http){
        return {
            getVmList: function() {
                var url = $routeParams.exerciseName;
                return $http.get(url);
            }
        };
    })

.factory('metricsService', function(JsonData) {
    function getMETs(exerciseName, metId, params) {
        var path = '/ecs/fve/Mets/' + exerciseName;

        if(angular.isDefined(metId) && (metId != null)) {
            path += '/' + metId;
        }

        return new JsonData(path, params);
    }

    return {
        getMETs: getMETs
    };
});
