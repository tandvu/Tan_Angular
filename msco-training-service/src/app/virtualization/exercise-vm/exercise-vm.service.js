angular.module('training-service.virtualization.exercise-vm.service', ['ngResource'])
    .factory('ExerciseVm', ['$resource', function ($resource) {
        return $resource('/ecs/vcs/ExerciseVirtualSystems/:exerciseEvent', {}, {
            query: { method: 'GET', params: {exerciseEvent: '@exerciseEvent'}, isArray: true}
        });
}]);