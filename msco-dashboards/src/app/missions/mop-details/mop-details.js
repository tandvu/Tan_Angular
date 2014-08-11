var MopDetailsCtrl = function ($scope, $modal) {
    $scope.open = function(title, size, data) {
        var modalInstance = $modal.open({
            templateUrl: 'missions/mop-details/mop-details.tpl.html',
            controller: 'MopDetailsInstanceCtrl',
            //size: size? size : 'lg',
            windowClass: 'mop-details-modal',
            resolve: {
                title: function() {
                    return title;
                },
                data: function(dashboardService, metricsService) {
                    return metricsService.getMETs(dashboardService.getSelectedExercise().name, data.metId).all();
                }
            }
        });
    };
};

var MopDetailsInstanceCtrl = function($scope, $modalInstance, utils, title, data) {
    $scope.title = title;

    var tableParams = {
        page: 1,
        count: 5
    };

    var tableSettings = {
        counts : [],
        total: data.length,
        getData : function ($defer, params) {
            $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    };

    $scope.dataTbl = utils.createNgTable(tableParams, tableSettings);

    $scope.close = function () {
        $modalInstance.close();
    };
};


angular.module("mopDetails", [
    'missionMetrics'
])

.controller('MopDetailsCtrl', MopDetailsCtrl);

