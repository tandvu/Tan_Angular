angular.module('overview.missions', [
    'ui.router',
    'missions.summary',
    'utils'
])

.config(function config( $stateProvider ) {
    $stateProvider.state('missions', {
        parent: 'overview',
        url: '/missions',
        views: {
            'dashboard@dashboard': {
                controller: 'MissionsCtrl',
                templateUrl: 'missions/missions.tpl.html'
            }
        },
        data: {
            pageTitle: 'Missions',
            displayName: 'Missions'
        },
        resolve: {
            missionsService: 'missionsService',
            missions: function(exerciseName, ExerciseService) {
                return ExerciseService.getMissions(exerciseName).all();
            }
        }
    });
})

.controller('MissionsCtrl',  function($state, $scope, $timeout, $q, exerciseName, ExerciseService, missionsService, missions) {
    $scope.missions = missions;

    $scope.loadMissionSummary = function(mission) {
        $scope.selectedMission = mission;
        missionsService.setSelectedMission(mission);
        $scope.selectedMission.index = $scope.missions.indexOf(mission);

        $state.go('summary', {missionId: $scope.selectedMission._id});
    };

    if($scope.missions.length) {
        findActiveProcesses(0);
    }

    function findActiveProcesses(missionIndex){
        ExerciseService.getInstanceTasks(exerciseName, {processInstanceId: missions[missionIndex].processId}).all()
            .then(function(instanceTasks) {
                var instanceTask;

                for (var i in instanceTasks) {
                    instanceTask = instanceTasks[i];

                    if (angular.isDefined(instanceTask.startTime) && angular.isUndefined(instanceTask.stopTime)) {
                        return missionIndex;
                    }
                }

                return $q.reject(missionIndex);
            }).then(
            function(missionIndex){
                createCarousel(missionIndex);
            },
            function(missionIndex){
                if(++missionIndex < missions.length) {
                    findActiveProcesses(missionIndex);
                }
            });
    }

    //create Carousel
    function createCarousel(currentIndex) {
        $timeout(function () {
            var startIndex = Math.max((currentIndex - 2), 0);
            var owl = angular.element("#missionsCarousel");

            owl.owlCarousel({
                items: Math.min($scope.missions.length, 4),
                itemsDesktop: [1199, 3],
                lazyLoad: true,
                pagination: true,
                autoPlay: false,
                baseClass: "owl-carousel",
                theme: "owl-theme",
                itemsScaleUp: false,

                // beforeInit:
                afterInit: function (el) {
                    if ($scope.missions.length > 1) {
                        el.trigger('owl.jumpTo', startIndex);

                        var slides = angular.element(".owl-item");
                        var i;

                        //add classes for styling the slider
                        for (i = 0; i < currentIndex; i++) {
                            angular.element(slides[i]).addClass("missionPast");
                        }

                        for (i = currentIndex + 1; i < slides.length; i++) {
                            angular.element(slides[i]).addClass("missionFuture");
                        }

                        angular.element(slides[currentIndex]).addClass("missionCurrent");

                        if (currentIndex > 0) {
                            angular.element(slides[0]).addClass("first");
                            angular.element(slides[currentIndex - 1]).addClass("last");
                        }

                        if (currentIndex < ($scope.missions.length - 1)) {
                            angular.element(slides[currentIndex + 1]).addClass("first");
                            angular.element(slides[slides.length - 1]).addClass("last");
                        }
                    }

                    //load current Mission
                    $scope.loadMissionSummary($scope.missions[currentIndex]);
                }
            });
        }, 0);
    }
})

.factory('missionsService',
    function($q, JsonData, utils, ExerciseService) {
        var selectedMission;

        function getActiveTasks(exerciseName, missionId) {
            return $q.all([ExerciseService.getProcessInstances(exerciseName, {missionId: missionId}).all(),
                ExerciseService.getInstanceTasks(exerciseName).all(),
                ExerciseService.getInstanceRoles(exerciseName).all()])
                .then(function(data) {
                    var processes = data[0],
                        tasks = data[1],
                        roles = data[2],
                        activeTasks = [];

                    angular.forEach(processes, function(process) {
                        if(process.missionId == missionId) {
                            if(angular.isDefined(process.startTime) && angular.isUndefined(process.endTime)) {
                                activeTasks.push(process);

                                process.instanceTasks = utils.findAllByKey(tasks, 'processInstanceId', process._id);
                                process.instanceRoles = utils.findAllByKey(roles, 'processInstanceId', process._id);
                            }
                        }
                    });

                    return activeTasks;
                });
        }

        function getParticipants(exerciseName, missionId) {
            return $q.all([ExerciseService.getUsers(exerciseName).all(),
                getActiveTasks(exerciseName, missionId)])
                .then(function(data) {
                    var users = data[0],
                        activeTasks = data[1],
                        participants = [];

                    angular.forEach(activeTasks, function(process) {
                        angular.forEach(process.instanceTasks, function(task) {
                            var user = utils.findByKey(users, 'info.name', task.user);

                            if(user && participants.indexOf(user) == -1) {
                                participants.push(user);
                            }
                        });
                    });

                    return participants;
                });
        }

        function getMissionMetrics(exerciseName) {
            var url = '/ecs/fve/MissionMetrics/' + exerciseName,
                params = {exercise: exerciseName};

            return new JsonData(url, params);
        }

        function getMissionProducts(exerciseName) {
            var url = '/ecs/fve/MissionProducts/' + exerciseName,
                params = {exercise: exerciseName};

            return new JsonData(url, params);
        }

        return {
            getSelectedMission: function(){return selectedMission;},
            setSelectedMission: function(mission){selectedMission = mission;},
            getActiveTasks: getActiveTasks,
            getParticipants: getParticipants,
            getMissionMetrics: getMissionMetrics,
            getMissionProducts: getMissionProducts
        };
    })
;