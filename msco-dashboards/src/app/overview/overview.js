angular.module('dashboard.overview', [
    'ui.router',
    'ngAnimate',
    'overview.svc',
    'truncate',
    'overview.missions',
    'overview.vm'
])

.config(function config( $stateProvider ) {
    $stateProvider.state('overview', {
        parent: 'dashboard',
        url: '/overview',
        views: {
            'dashboard': {
                templateUrl: 'overview/overview.tpl.html',
                controller: 'OverviewCtrl'
            }
        },
        data: {
            pageTitle: 'Overview',
            displayName: '{{exerciseName}}'
        },
        resolve: {
            exerciseName: function ($stateParams) {
                return $stateParams.exerciseName;
            }
        }
    });
})

    .controller('OverviewCtrl', function ($scope, $http, $modal, $stateParams, getTasksService, getIssuesService, getExercisesService, getVMsService) {
        var exercise = $scope.$parent.selectedExercise;

        $scope.openCurrent = function () {
            $modal.open({
                templateUrl: 'overview/currentTask/currentTask.tpl.html',
                controller: 'CurrentTasksInstanceCtrl'
            });
        };

        $scope.openUpcoming = function () {
            $modal.open({
                templateUrl: 'overview/upcomingTask/upcomingTask.tpl.html',
                controller: 'UpcomingTaskInstanceCtrl'
            });
        };

        $scope.openIssues = function () {
            $modal.open({
                templateUrl: 'overview/majorIssues/majorIssues.tpl.html',
                controller: 'MajorIssuesInstanceCtrl'
            });
        };

        //get CurrentTasks
        getTasksService.getTasks($stateParams.exerciseName)
            .success(function (rawData) {
                var data = rawData;
                var completedTaskList = [];
                var activeTaskList = [];

                for (i = 0; i < data.length; i++)
                {
                    if (data[i].hasOwnProperty('stopTime')) {
                        completedTaskList.push(data[i]);
                    }
                    else {
                        activeTaskList.push(data[i]);
                    }
                }

                if (activeTaskList.length > 3) {
                    $scope.activeTaskListFE = new Array(activeTaskList[0], activeTaskList[1], activeTaskList[3]);
                }
                else {
                    $scope.activeTaskListFE = activeTaskList;
                }

        //get UnstartedTasks
        var unstartedTasks = [];

        //get all missions for this exercise
        getTasksService.getMissions($stateParams.exerciseName).
            success(function (rawData) {
                for (i=0;i<rawData.length;i++) {
                    getUnstartedTasks(i, rawData);
                }
            }).error(function (data) {
                alert (data);
                });

        //foreach mission of this exercise, use _id to query for unstartedTask
        var getUnstartedTasks = function(i, missions){

            getTasksService.getUnstartedTasks($stateParams.exerciseName, missions[i]._id).
                success(function (rawData) {
                    for (j=0;j<rawData.length;j++) {
                        rawData[j].missionName = missions[i].name;
                    }
                    unstartedTasks = unstartedTasks.concat(rawData);
                    $scope.unstartedTaskList = unstartedTasks;

                    if (unstartedTasks.length > 3) {
                        $scope.unstartedTaskListFE = new Array(unstartedTasks[0], unstartedTasks[1], unstartedTasks[3]);
                    }
                    else {
                        $scope.unstartedTaskListFE = unstartedTasks;
                    }
                });
        };

                $scope.activeTaskList = activeTaskList;
                $scope.completedTaskList = completedTaskList;

                //display 0 by default
                $scope.unstartedTaskList = unstartedTasks;
                $scope.totalVM = deployedList.length;
                $scope.onVM = poweredOn;
                $scope.offVM = poweredOff;
                $scope.suspendedVM = suspended;
                $scope.errors = errorData;

                //line data
                var lineChartData = {
                    labels: ["Completed", "Active", "Planned"],
                    datasets: [
                        {
                            fillColor: "rgba(151,187,205,0.5)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            data: [completedTaskList.length, activeTaskList.length, unstartedTasks.length]
                        }
                    ]
                };
                var options = {
                    scaleIntegersOnly: true,
                    scaleBeginAtZero: true,
                    animation: false
                };
                var myLine = new Chart(document.getElementById("canvasBar").getContext("2d")).Line(lineChartData, options);

            }).error(function (data) {
            });

        //get exercise info
        getExercisesService.getExercise($stateParams.exerciseName).
            success(function (rawData) {
            var exercises = rawData;

            $scope.poc = exercises[0].poc;
            $scope.description = exercises[0].description;
        });

        //get major issues
        var errorData =[];
        getIssuesService.getIssues($stateParams.exerciseName).
            success(function (rawData) {
                errorData = rawData;
                $scope.errors = errorData;

                if (errorData.length > 4) {
                    $scope.errorsShort = new Array(errorData[0], errorData[1], errorData[3], errorData[4]);
                }
                else
                {
                    $scope.errorsShort = errorData;
                }

            }).error(function (data) {
//                alert("error get issues" + data);
            });

        //get vm info
        var poweredOn = 0;
        var suspended = 0;
        var poweredOff = 0;
        var VMloopCount = 0;
        var deployedList=[];
        getVMsService.getVMs($stateParams.exerciseName).
            success(function (rawData) {
                var VMdata = rawData;

                //pie data
                for (i = 0; i < VMdata.length; i++) {
                    try{
                        if (VMdata[i].deploymentStatus == 'DEPLOYED') {
                            deployedList.push(VMdata[i].uniqueCloudVmId);
                        }
                    }
                    catch (err) {}
                }

                var getDeployedVMs = function(i){

                    getVMsService.getVMStatus(deployedList[i]).
                        success(function (rawData) {
                            VMloopCount++;
                            if (rawData[0].runningStatus == 'POWERED_ON') {
                                poweredOn++;
                            }
                            if (rawData[0].runningStatus == 'SUSPENDED') {
                                suspended++;
                            }
                            if (rawData[0].runningStatus == 'POWERED_OFF') {
                                poweredOff++;
                            }

                            //update view after all calls are made
                            if (VMloopCount == deployedList.length)
                            {
                                $scope.totalVM = deployedList.length;
                                $scope.onVM = poweredOn;
                                $scope.offVM = poweredOff;
                                $scope.suspendedVM = suspended;

                                var pieData = [
                                    {
                                        value: poweredOn,
                                        color: "#99C68E"
                                    },
                                    {
                                        value: suspended,
                                        color: "#FFC870"
                                    },
                                    {
                                        value: poweredOff,
                                        color: "#DC381F"
                                    }
                                ];
                                var options = {
                                    animation: false
                                };
                                var myPie = new Chart(document.getElementById("canvasPie").getContext("2d")).Pie(pieData, options);
                                VMloopCount = 0;
                            }

                        });
                };

                for (i = 0; i < deployedList.length; i++)
                {
                    getDeployedVMs(i);
                }
            }).error(function (data) {
            });

    })
;

