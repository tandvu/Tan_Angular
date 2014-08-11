angular.module('training-service.virtualization.vm.service', ['ngResource', 'training-service.virtualization.exercise-vm.service'])

    .factory('Vm', ['$resource', function ($resource) {
        return {
            Entry: $resource('/ecs/vcs/virtualMachines/:uid', {}, {
                query: { method: 'GET', params: {uid: '@uid'}, isArray: true}
            }),
            Commands: $resource('/ecs/vcs/:command/:uid', {}, {
                start: {method: 'PUT', params: {command: 'startVm', uid: '@uid'}, isArray: true},
                stop: {method: 'PUT', params: {command: 'stopVm', uid: '@uid'}, isArray: true},
                suspend: {method: 'PUT', params: {command: 'suspendVm', uid: '@uid'}, isArray: true}
            })
        };
    }])

    .service('VmService', ['ExerciseVm', 'Vm', function(ExerciseVm, Vm) {

        this.virtualMachineStatus = function(exercise, scope) {

            var vmStatusList = [];

            ExerciseVm.query({exerciseEvent: exercise.name}, function (exerciseVMs) {

                scope.waitingOnVMs = true;

                var validExerciseVmIdList = [];

                for (var i in exerciseVMs) {
                    if (exerciseVMs[i].uniqueCloudVmId) {
                        validExerciseVmIdList.push(exerciseVMs[i].uniqueCloudVmId);
                    }
                }

                function vmStatusListPush (vmStatus) {
                    vmStatusList.push(vmStatus[0]);
                    if (vmStatusList.length == validExerciseVmIdList.length) {
                        scope.waitingOnVMs = false;
                    }
                }

                if (validExerciseVmIdList.length < 1) {
                    scope.waitingOnVMs = false;
                }

                for (i in validExerciseVmIdList) {
                    Vm.Entry.query({uid: validExerciseVmIdList[i]}, vmStatusListPush);
                }
            });
            return vmStatusList;
        };
    }]);