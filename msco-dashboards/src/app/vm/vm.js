angular.module('overview.vm', [
    'vm.svc',
    'ui.router',
    'angularSpinner'
])

    .config(function config($stateProvider) {
        $stateProvider.state('vmInfo', {
            parent: 'overview',
            url: '/vmInfo',
            views: {
                'dashboard@dashboard': {
                    controller: 'EvsCtrl',
                    templateUrl: 'vm/vm2.tpl.html'
                }
            },
            data: {
                pageTitle: 'VM Info',
                displayName: 'VM'
            }
        });
    })

    .controller('VmCtrl', function ($scope, $stateParams, GetVMsService, GetVmStatusService, ngTableParams, $filter, usSpinnerService) {
        var tmpVmList = [];

        /* jshint loopfunc:true */
        GetVMsService.query({'exerciseName': $stateParams.exerciseName}).$promise.then(
            function (EvsData) {
                return EvsData.filter(isDeployed);
            }, function (reason) {
                usSpinnerService.stop('spinner-1');
            }
        ).then(function (evsData) {
                for (var index in evsData) {
                    GetVmStatusService.query({'uniqueCloudVmId': evsData[index].uniqueCloudVmId}).$promise.then(
                        function (VmData) {
                            tmpVmList.push(VmData[0]);

                            if (tmpVmList.length == evsData.length) {
                                usSpinnerService.stop('spinner-1');
                                var data = tmpVmList;

                                /* jshint -W055 */ // XXX: ngTableParams.  This need to be here or grunt will complain about ngTableParams
                                $scope.tableParams = new ngTableParams({
                                    page: 1,            // show first page
                                    count: 10           // count per page
                                }, {
                                    total: data.length, // length of data
                                    getData: function ($defer, params) {
                                        // use build-in angular filter
                                        var orderedData = params.sorting() ?
                                            $filter('orderBy')(data, params.orderBy()) :
                                            data;

                                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                                    }
                                });
                            }
                        });
                }
            });

        // Define a callback function.
        function isDeployed(value, index, ar) {
            if (value.deploymentStatus == "DEPLOYED") {
                return true;
            }
            return false;
        }

        //Format VM running status
        $scope.runningStatus = function (value) {
            var tmp = value.replace("_", " ").toLowerCase();
            return tmp.charAt(0).toUpperCase() + tmp.slice(1);
        };
    })

    //Return EVS (Exercise Virtual System (Not VM Status))
    .controller('EvsCtrl',
    function EvsController($scope, GetEvsHttpService, ngTableParams, $filter, $q) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        $scope.viewLoading = true;
        $scope.finishLoading = false;

        promise.then(GetEvsHttpService.getTevsList().then(function (EvsData) {
                var data = EvsData.data.filter(isDeployed);  //The name has to be "data" so ngTable would work

                /* jshint -W055 */ // XXX: ngTableParams.  This need to be here or grunt will complain about ngTableParams
                $scope.tableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 10           // count per page
                }, {
                    total: data.length, // length of data
                    getData: function ($defer, params) {
                        // use build-in angular filter
                        var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) :
                            data;

                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            })
        );

        // Define a callback function.
        function isDeployed(value, index, ar) {
            if (value.deploymentStatus == "DEPLOYED") {
                return true;
            }
            return false;
        }
    })

    .controller('VmStatusCtrl',
    function VmController($scope, GetVmHttpService, $q, usSpinnerService) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        $scope.finishLoading = false;


        promise.then(GetVmHttpService.getVmList($scope.evs.uniqueCloudVmId).then(function (vmData) {
            $scope.vmList = vmData.data;
            $scope.finishLoading = true;
        }));

        //Format VM running status
        $scope.runningStatus = function (value) {
            var tmp = value.replace("_", " ").toLowerCase();
            return tmp.charAt(0).toUpperCase() + tmp.slice(1);
        };
    }
)

    .directive('loadingSpinner', function () {
        return {
            restrict: 'E',
            template: "<span ng-hide='finishLoading'><img src='assets/img/spinner.gif'/></span>"
        };
    })
;

