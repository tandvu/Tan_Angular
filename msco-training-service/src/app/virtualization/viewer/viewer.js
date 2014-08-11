angular.module('training-service.virtualization.viewer',[
    'training-service.virtualization.vm.service',
    'ngGrid',
    'ui.router'
])
    .config(function config($stateProvider, $urlRouterProvider) {
        $stateProvider .state( 'virtualizationViewer', {
            url: '/virtualizationViewer',
            views: {
                "main": {
                    controller: 'ViewerCtrl',
                    templateUrl: 'virtualization/viewer/viewer.tpl.html'
                }
            },
            data:{ pageTitle: 'Virtualization Viewer' }
        });
        $urlRouterProvider.otherwise("/virtualizationViewer");
    })
    .controller('ViewerCtrl', ['$scope', '$rootScope', 'Vm', 'VmService', function ($scope, $rootScope, Vm, VmService) {

        $scope.waitingOnVMs = false;

        $scope.queryVMs = function() {
            $scope.vms = VmService.virtualMachineStatus($scope.exercise, $scope);
        };

        $scope.queryExercises = function() {
            $scope.exercise = $rootScope.selectedExercise;
            $scope.queryVMs();
        };

        $scope.queryExercises();

        /* startVM() - start a VM via the Virtualization Service
         */

        $scope.startVM = function(entity) {
            Vm.Commands.start({uid: entity.uid}, function(data) {
                $scope.queryVMs();
            });
        };

        /* stopVM() - stop a VM via the Virtualization Service
         */

        $scope.stopVM = function(entity) {
            Vm.Commands.stop({uid: entity.uid}, function(data) {
                $scope.queryVMs();
            });
        };

        /* suspendVM() - suspend/pause a VM via the Virtualization Service
         */

        $scope.suspendVM = function(entity) {
            Vm.Commands.suspend({uid: entity.uid}, function(data) {
                $scope.queryVMs();
            });
        };


        $scope.openConsole = function(entity) {

            /* TODO: Add in logic to check to see if we are in an OWF context or not. If not, use the window.open function to open a new
             *  browser window rather than attempting to launch an OWF widget.
             */

            var vmName = entity.name;

            var vmNameJSON = {vmName: vmName};

            // TODO: Remove data field or set it to empty string (no longer needed)

            // TODO: Replace hard coded guid with a function to lookup the guid from the widget name?

            if (OWF && OWF.Launcher && OWF.Launcher.launch) {

                // TODO: move this into an init function
                OWF.relayFile = "js/eventing/rpc_relay.uncompressed.html";

                OWF.Launcher.launch({
                    guid: "16dd3805-8ff9-42ee-a72d-3f79b44890b8",
                    launchOnlyIfClosed: false,
                    title: "VM Viewer - " + vmName,
                    data: Ozone.util.toString(vmNameJSON)
                });
            }
            else {
                // TODO: The first part of this URL should be pulled from a configuration file.
                window.open("http://msco-guacamole.sd.spawar.navy.mil/guacamole/client.xhtml?id=c/" + vmName);
            }
        };

//        function launchJMMJMTLibrary() {
//
//            // TODO: move this into an init function
//            OWF.relayFile = "js/eventing/rpc_relay.uncompressed.html";
//
//            OWF.Launcher.launch({
//                guid: "4cc44d0a-2d78-4ea1-8101-3dba96bef439",
//                launchOnlyIfClosed: true,
//                title: "JMM/JMT Library"
//            });
//        }


        // Grid options for VM list VM View

        $scope.vmGridOptions = {
            data: 'vms',
            enableRowSelection: false,
            sortInfo: {fields: ['name'], directions: ['asc']},
            columnDefs: [
                {field: 'name', displayName: 'Name', width: "*******"},
                {displayName: 'Status', cellTemplate: 'virtualization/vm/vm-status.tpl.html', width: "**"},
                {displayName: 'Control', cellTemplate: 'virtualization/vm/vm-control.tpl.html', width: "*"},
                {displayName: 'Console', cellTemplate: 'virtualization/vm/vm-console.tpl.html', width: "*"}
            ]
        };
    }]);