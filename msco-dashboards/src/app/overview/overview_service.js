var myService = angular.module('overview.svc', []);

myService.factory('getTasksService', function($http){
    return {
        getTasks: function(name) {
            var url = '/ecs/fve/InstanceTasks/' + name;
            return $http.get(url);
        },
        getUnstartedTasks: function(name, id) {
            var url = '/ecs/fve/UnstartedTasks/' + name + '/' + id;
            return $http.get(url);
        },
        getMissions: function(name) {
            var url = '/ecs/fve/Missions/' + name;
            return $http.get(url);
        }
    };
});

myService.factory('getExercisesService', function($http){
    return {
        getExercise: function(name) {
            var url = '/ecs/Exercises?name=' + name;
            return $http.get(url);
        }
    };
});

myService.factory('getVMsService', function($http){
    return {
        getVMs: function(name) {
            var url = '/ecs/vcs/ExerciseVirtualSystems/' + name;
            return $http.get(url);
        },
        getVMStatus: function(id) {
            var url = '/ecs/vcs/virtualMachines/' + id;
            return $http.get(url);
        }
    };
});

myService.factory('getIssuesService', function($http){
    return {
        getIssues: function(name) {
            var url = '/ecs/Logging/Error/' + name;
            return $http.get(url);
        }
    };
});