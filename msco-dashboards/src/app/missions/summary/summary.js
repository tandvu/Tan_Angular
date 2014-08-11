angular.module('missions.summary', [
    'ui.router',
    'ui.bootstrap',
    'missions.details',
    'metsDirective'
])

.config(function config( $stateProvider ) {
    $stateProvider.state('summary', {
        parent: 'missions',
        url: '/:missionId',
        views: {
            'tasks': {
                templateUrl: 'missions/summary/summary.tpl.html',
                controller: 'MissionsSummaryCtrl'
            }
        },
        data: {
            pageTitle: 'summary',
            displayName: '{{missionName}}'
        },
        resolve: {
            missionName: function($stateParams, exerciseName, ExerciseService, missionsService) {
                var selectedMission = missionsService.getSelectedMission();

                if(!selectedMission) {
                    return ExerciseService.getMissions(exerciseName + '/' + $stateParams.missionId)
                        .get($stateParams.missionId).then(function(mission) {
                            missionsService.setSelectedMission(mission);
                            return mission.name;
                        });
                }

                return selectedMission.name;
            },
            summaryData: function(missionsService, exerciseName, $stateParams, $q) {
                var missionId = $stateParams.missionId;

                var summaryData = {
                    'activeTasks': missionsService.getActiveTasks(exerciseName, missionId),
                    'participants': missionsService.getParticipants(exerciseName, missionId),
                    'missionMetrics': missionsService.getMissionMetrics(exerciseName).getByKey('missionId', missionId),
                    'missionProducts': missionsService.getMissionProducts(exerciseName).getByKey('missionId', missionId)
                };

                return $q.all(summaryData);
            }
        }
    });
})

.controller('MissionsSummaryCtrl',
    function($scope, utils, missionName, missionsService, summaryData) {
        $scope.missionName = missionName;

        if(!angular.isArray(summaryData['missionProducts'])) {
            summaryData['missionProducts'] = [summaryData['missionProducts']];
        }
        angular.extend(missionsService.getSelectedMission(), summaryData);

        var tableParams = {
            page: 1,
            count: 3
        };
        var tableSettings = {};

        var activeTasks = [], participants = [], missionMetrics = [], missionProducts = [];

        //active tasks table
        if(summaryData['activeTasks']) {
            activeTasks = summaryData['activeTasks'];
        }
        tableSettings = {
            counts : [],
            total: activeTasks.length,
            getData : function ($defer, params) {
                $defer.resolve(activeTasks.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.activeTasksTbl = utils.createNgTable(tableParams, tableSettings);



        //participants table
        if(summaryData['participants']) {
            participants = summaryData['participants'];
        }
        tableSettings = {
            counts : [],
            total: participants.length,
            getData : function ($defer, params) {
                $defer.resolve(participants.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.participantsTbl = utils.createNgTable(tableParams, tableSettings);



        //mission metrics table
        $scope.missionMetrics = summaryData['missionMetrics'];
        if(summaryData['missionMetrics']) {
            missionMetrics.push((summaryData['missionMetrics']).metrics);
        }
        tableSettings = {
            counts : [],
            total: missionMetrics.length,
            getData : function ($defer, params) {
                $defer.resolve(missionMetrics.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.missionMetricsTbl = utils.createNgTable(tableParams, tableSettings);



        //data products table
        if(summaryData['missionProducts']) {
            missionProducts = summaryData['missionProducts'];
        }
        tableSettings = {
            counts : [],
            total: missionProducts.length,
            getData : function ($defer, params) {
                $defer.resolve(missionProducts.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.missionProductsTbl = utils.createNgTable(tableParams, tableSettings);
    }
)
;