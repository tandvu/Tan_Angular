/**
 * Created by tanvu on 6/19/2014.
 */
angular.module('ngBoilerplate.dashboard', [
    'ui.router',
    'ui.bootstrap',
    'dashboard.breadcrumbs',
    'dashboard.overview'
])

.config(function config($stateProvider) {
    $stateProvider
        .state('dashboard', {
            abstract: true,
            url: '/dashboard/:exerciseName',
            templateUrl: 'dashboard/dashboard.tpl.html',
            controller: 'DashboardCtrl',
            data: {
                proxy: 'dashboard.exercise'
            }
        });
})

.controller('DashboardCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'dashboardService',
    function ($rootScope, $scope, $state, $stateParams, dashboardService) {
        $rootScope.$state = $state;

        $scope.selectedExercise = {
            "name": $stateParams.exerciseName,
            "poc": null,
            "role": null,
            "description": null,
            "state": null,
            "filepath": null
        };

        dashboardService.setSelectedExercise($scope.selectedExercise);
    }
])

.factory('dashboardService', function() {
    var selectedExercise = {};
    return {
        getSelectedExercise : function() {
            return selectedExercise;
        },
        setSelectedExercise : function(exercise) {
            selectedExercise = exercise;
        }
    };
})

;


