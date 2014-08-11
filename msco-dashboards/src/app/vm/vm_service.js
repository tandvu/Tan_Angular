var myService = angular.module('vm.svc', ['ngResource']);


//Return list of VMs for an exercise using ng-resource
myService.factory('GetVMsService', function($resource){
    var vmUrl = '/ecs/vcs/ExerciseVirtualSystems/:exerciseName';
    return $resource(vmUrl, {exerciseName: "@exerciseName"});
});

//Return list of VM Status for a VM using ng-resource
myService.factory('GetVmStatusService', function($resource){
    var url = '/ecs/vcs/virtualMachines/:uniqueCloudVmId';
    return $resource(url, {uniqueCloudVmId: "@uniqueCloudVmId"});
});

//Return list of evs for an exercise using $http
myService.factory('GetEvsHttpService', function($stateParams, $http){
    return {
        getTevsList: function() {
            var url = '/ecs/vcs/ExerciseVirtualSystems/' + $stateParams.exerciseName;
            return  $http.get(url);
        }
    };
});

//Return list of VM for a evs using $http
myService.factory('GetVmHttpService', function($stateParams, $http){
    return {
        getVmList: function(uniqueCloudVmId) {
            var url = 'http://msco-cf-web-dev/ecs/vcs/virtualMachines/' + uniqueCloudVmId;
            return  $http.get(url);
        }
    };
});

/*
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



//Return list of evs for an exercise using $http
myService.factory('GetEvsHttpService', function($stateParams, $http){
    return {
        getTevsList: function() {
            var url = '/ecs/vcs/ExerciseVirtualSystems/' + $stateParams.exerciseName;
            return  $http.get(url);
        }
    };
});

//Return list of VM for a evs using $http
myService.factory('GetVmHttpService', function($stateParams, $http){
    return {
        getVmList: function(uniqueCloudVmId) {
            var url = 'http://msco-cf-web-dev/ecs/vcs/virtualMachines/' + uniqueCloudVmId;
//            var url = 'assets/json_data/' + uniqueCloudVmId + '_vm.json';
//            alert('vm_service.url ' + url);
            return  $http.get(url);
        }
    };
});

//Return list of VM Status for a tevs using ng-resource
myService.factory('GetVmService', function($resource){
    var url = '/ecs/vcs/virtualMachines/:uniqueCloudVmId';
    return $resource(url,
        {uniqueCloudVmId: "@uniqueCloudVmId"}
    );
});


//Return list of missions for an exercise using $http
myService.factory('GetTrngEventVirtualSystems2', function($stateParams, $http){
    return {
        getVmList: function() {
            var url = '/ecs/vcs/ExerciseVirtualSystems/' + $stateParams.exerciseName;
//            var url = 'assets/json_data/' + $stateParams.exerciseName + 'VM.json';

            return  $http.get(url);
        }
    };
});
*/