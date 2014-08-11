angular.module( 'missions.details', [
    'ui.router',
    'utils',
    'metsDirective',
    'angularBootstrapNavTree',
    'infoPopupDirective'
])

.config(function config( $stateProvider ) {
    $stateProvider.state('details', {
        parent: 'summary',
        url: '/details/:taskName',
        views: {
            'dashboard@dashboard': {
                templateUrl: 'missions/details/details.tpl.html',
                controller: 'MissionDetailsCtrl'
            }
        },
        data: {
            pageTitle: 'details',
            displayName: '{{taskName}}'
        },
        resolve: {
            selectedMission: function($stateParams, exerciseName, ExerciseService, missionsService) {
                var selectedMission = missionsService.getSelectedMission();

                if(!selectedMission) {
                    return ExerciseService.getMissions(exerciseName + '/' + $stateParams.missionId)
                        .get($stateParams.missionId).then(function(mission) {
                            missionsService.setSelectedMission(mission);

                            return mission;
                        });
                }

                return selectedMission;
            },
            taskName: function ($stateParams) {
                return $stateParams.taskName;
            }
        }
    });
})

.controller('MissionDetailsCtrl',
    function($scope, $http, $q, $timeout, utils, selectedMission, missionsService, taskName) {
        var activeTasks =  selectedMission.activeTasks,
            tasks = [],
            tableSettings = {},
            tableParams = {
                page: 1,
                count: 3
            },
            participants = [], dataProducts = [], missionMetrics = [];


        $scope.treeHandler = function(branch) {
            var taskDetails = {};
            if(branch.label == 'all') {
                taskDetails = loadAllTasks();
            }
            else {
                taskDetails = loadTask(branch.label);
            }

            participants = taskDetails.participants;
            $scope.time = taskDetails.time;

            try {
                $scope.participantsTbl.reload();
            } catch(err) {}

        };

        function loadAllTasks() {
            var participants = [], time;

            for(var i in activeTasks) {
                participants = participants.concat(loadTask(activeTasks[i].name).participants);
            }

            time = {
                start: 'N/A',
                remaining: 'N/A',
                projected: 'N/A'
            };

            return {
                participants: participants,
                time: time
            };
        }

        function loadTask(taskname) {
            var user,
                users = missionsService.getSelectedMission().participants,
                selectedTask = utils.findByKey(activeTasks, "name", taskname),
                instanceTask;

            var participants = [], metrics;

            if(selectedTask != null) { //selected task is a process instance
                for(var i in selectedTask.instanceTasks) {
                    instanceTask = selectedTask.instanceTasks[i];
                    user = utils.findByKey(users, "info.name", instanceTask.user);

                    if(user && participants.indexOf(user) == -1) {
                        participants.push(user);
                    }
                }
            }
            else { //selected task is an instance task
                for(var j in activeTasks) {
                    selectedTask = utils.findByKey(activeTasks[j].instanceTasks, "name", taskname);

                    if(selectedTask) {
                        user = utils.findByKey(users, "info.name", selectedTask.user);

                        if(user && participants.indexOf(user) == -1) {
                            participants.push(user);
                        }

                        break;
                    }
                }
            }

            $scope.selectedTask = selectedTask;

            var time = {
                start: $scope.selectedTask.startTime,
                remaining: '?',
                projected: '?'
            };

            return {
                participants: participants,
                time: time
            };
        }

        angular.forEach(selectedMission.activeTasks, function(activeTask) {
            var instanceTasks = [];

            angular.forEach(activeTask.instanceTasks, function(instanceTask) {
                instanceTasks.push({
                    label: instanceTask.name
                });
            });

            tasks.push({
                label: activeTask.name,
                children: instanceTasks
            });
        });

        $scope.tasks = [{
            label: 'all',
            children: tasks
        }];


        $scope.treeControl = {};

        var branch = {label: taskName};
        $scope.treeHandler(branch);

        $timeout(function() {
            $scope.treeControl.set_initial_branch(taskName);
        }, 0);


        //participants table
        tableSettings = {
            counts : [],
            total: participants.length,
            getData : function ($defer, params) {
                $defer.resolve(participants.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.participantsTbl = utils.createNgTable(tableParams, tableSettings);


        //data products table
        if(selectedMission.missionProducts) {
            dataProducts = selectedMission.missionProducts;
        }
        tableSettings = {
            counts : [],
            total: dataProducts.length,
            getData : function ($defer, params) {
                $defer.resolve(dataProducts.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.dataProductsTbl = utils.createNgTable(tableParams, tableSettings);


        //task metrics table
        if(selectedMission.missionMetrics) {
            missionMetrics = selectedMission.missionMetrics.metrics;
        }
        tableSettings = {
            counts : [],
            total: missionMetrics.length,
            getData : function ($defer, params) {
                $defer.resolve(missionMetrics.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        };
        $scope.taskMetricsTbl = utils.createNgTable(tableParams, tableSettings);
    }
)
;