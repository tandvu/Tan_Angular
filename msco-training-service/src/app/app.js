angular.module( 'training-service', [
  'templates-app',
  'templates-common',
  'truncate',
  'angularFileUpload',
  'training-service.services.conf',
  'training-service.services.ecs',
  'training-service.services.fms',
  'training-service.start',
  'training-service.trainee',
  'training-service.trainer',
  'training-service.download',
  'training-service.upload',
  'training-service.virtualization.viewer',
  'ui.router'
])

.config( function config ( $stateProvider, $urlRouterProvider, $locationProvider) {

  //if (window.history && window.history.pushState) {
  //  $locationProvider.html5Mode(true);
  //}

  $urlRouterProvider.when( '/trainer', '/trainer');
  $urlRouterProvider.when( '/trainee', '/trainee');
  $urlRouterProvider.when( '/virtualizationViewer', '/virtualizationViewer');
  $urlRouterProvider.otherwise( '/' );
})

.controller( 'AppCtrl', function trainingServiceCtrl ( $scope, $rootScope, $location, $window, $modal, $timeout, $sce, getConfigurationService, ecsService, fileManagementService) {
  //console.log('AppCtrl begins...');

  $rootScope.pageTitle="MSCO Training Service";

  if (!$rootScope.config) {
    getConfigurationService.getConfig().success(function (data) {
      $rootScope.config = data._configurationdata;
    });
  }

  //$rootScope.selectedMission = {name:"none"};
  $rootScope.instanceRoles = [];
  $rootScope.missions = [];

  $rootScope.exerciseInfoTemplate = {name: 'ExerciseInfo', url: 'exercise/exerciseInfo.tpl.html'};
  $rootScope.metricsTemplate = {name: 'Metrics', url: 'metrics/metrics.tpl.html'};
  $rootScope.measuresTemplate = {name: 'Measures', url: 'metrics/measures.tpl.html'};
  $rootScope.taskTemplate = {name: 'TaskDetails', url: 'tasks/task.tpl.html'};
  $rootScope.summaryTemplate = {name: 'MissionSummary', url: 'summary/summary.tpl.html'};
  $rootScope.trainerTemplates = [
    {name: 'Overview', url: 'trainer/overview/overview.tpl.html'},
    {name: 'Missions', url: 'trainer/missions/missions.tpl.html'},
    {name: 'Systems', url: 'virtualization/viewer/viewer.tpl.html'}//'trainer/systems/systems.tpl.html'}
  ];


  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (angular.isDefined(toState.data.pageTitle)) {
      $rootScope.pageTitle = toState.data.pageTitle;// + ' | training-service' ;
      //console.log("stateChange changes title to " + $rootScope.pageTitle);
    }
  });

  $scope.launch = function() {
    $rootScope.modalInstance = $modal.open({
      backdrop: 'static',
      keyboard: true,
      templateUrl: 'start/start.tpl.html'
    });
  };

  $scope.leave = function() {
    //console.log('leave from ' + $location.absUrl());
    delete $rootScope.selectedExercise;
    delete $rootScope.selectedUser;
    delete $rootScope.selectedRole;
    // clear out exercise info and redirect to /

    $location.path('/');
    //console.log('set window.location to '+$location.absUrl());
    $window.location = $location.absUrl();
    $window.location.reload();
  };

  $rootScope.selectMission = function(m) {
    //console.log('selectMission('+missionName+') begins...');
    $rootScope.selectedMission = m;
    //console.log("selectedMission is now "+$rootScope.selectedMission.name);
    if ($rootScope.selectedMissionOption !== 'Summary' && !!m.tasks && m.tasks.length > 0) {
      $rootScope.selectTask(m.tasks[m.tasks.length-1]);
    }
    //console.log('...ends selectMission('+missionName+')');
  };

  $rootScope.selectTask = function(task) {
    if (!$rootScope.selectedMission.selectedTask || $rootScope.selectedMission.selectedTask._id !== task._id) {
     // var barf = new Error('selectTask from...');
      //console.log(barf.stack);
      $rootScope.selectedTaskOption = task.name;
      //$scope.selectedMissionOption = 'Task';
      if (!!task.startTime && !task.stopTime) {
        task.taskFormUrl = $sce.trustAsResourceUrl(ecsService.getTaskFormUrl(task._id));
        //$rootScope.updateTaskFormFor(task);
        //console.log("taskFormUrl is "+task.taskFormUrl);
      } else {
        delete task.taskFormUrl;
      }
      $rootScope.selectedMission.selectedTask = task;
      //console.log("need to display the Task Details for "+task.name);

    }
    console.log("selectedTask is now " + $rootScope.selectedMission.selectedTask.name + " -- " + $rootScope.selectedMission.selectedTask._id);
    console.log(JSON.stringify($rootScope.selectedMission.selectedTask));
  };

  /*$rootScope.updateTaskFormFor = function(task) {
    console.log('updateTaskFormFor '+task.name);
    ecsService.getTaskForm(task._id).success(function (r) {
      console.log(JSON.stringify(r));
      task.taskFormUrl = r.formUrl;
    }).error(function(d, s, h, c) {
      console.log(JSON.stringify(d));
    });
    //task.taskFormUrl = $sce.trustAsResourceUrl(ecsService.getTaskFormUrl(task._id));
  };*/

  $rootScope.getMissionPlaybackState = function(mission) {

    if (!!mission.processInstance && !!mission.processInstance.stopTime) {
      return 'complete';
    }
    if (mission.processInstance==null || mission.processInstance.startTime==null) {
      return 'unstarted';
    }
    return 'started';
  };

  $rootScope.startMission = function(mission) {
    //console.log('startMission '+mission.name);
    ecsService.startMission(mission._id).success(function(responseData) {
      $rootScope.updateMissions();
      //mission.time = responseData.startTime;
      //$rootScope.updateProcessInstancesFor(mission, $rootScope.sortMissions);
    }).error(function(data) {
      console.log(JSON.stringify(data));
    });
  };

  $rootScope.stopMission = function(mission) {
    //console.log('stopMission '+mission.name);
    ecsService.stopMission(mission._id).success(function(responseData) {
      $rootScope.updateMissions();
      // update the mission from the response data..
      //mission.time = responseData.time;
      //$rootScope.updateProcessInstancesFor(mission, $rootScope.sortMissions);
    }).error(function(data) {
      console.log(JSON.stringify(data));
    });
  };

  $rootScope.replayMission = function(mission) {
    console.log('TODO: define what happens for replayMission('+mission.name+")");
  };

  $rootScope.startTask = function(mission, unstartedTask) {
    //console.log("startTask "+unstartedTask.name);
    ecsService.startTask(mission._id, unstartedTask.pesTaskId).success(function(responseData) {
      //console.log(JSON.stringify(responseData));
      var it = responseData[0];
      // add the TUI user name instead of the jbpm user name
      ecsService.putInstanceTaskUser(it, $rootScope.selectedUser.info.name).success(function() {
        $rootScope.updateMissions();
      });
    });
  };

  /*$rootScope.onTaskIFrameLoad = function(instanceTaskId) {
    var taskIFrame = document.getElementById("TaskForm-"+instanceTaskId);
    console.log("found taskIFrame ? "+(!!taskIFrame ? "true":"false"));

    var gwtframes = $rootScope.getIFrameDocument(taskIFrame).getElementsByClassName("gwt-Frame");
    console.log("found "+(!!gwtframes?gwtframes.length:0)+" iframes with gwt-Frame class");

    var taskHtmlForm = $rootScope.getIFrameDocument(gwtframes[0]).getElementsByTagName("form")[0];

    var taskHtmlInputs = $rootScope.getIFrameDocument(gwtframes[0]).getElementsByTagName("input");
    var taskHtmlSelects = $rootScope.getIFrameDocument(gwtframes[0]).getElementsByTagName("select");

    console.log("found taskHtmlForm with "+taskHtmlInputs.length+" inputs and "+taskHtmlSelects.length+" selects");
    for (var i = 0; i < taskHtmlInputs.length; i++) {
      console.log(taskHtmlInputs[i].name+" -- "+taskHtmlInputs[i].value);
    }
    for (var j = 0; j < taskHtmlSelects.length; j++) {
      console.log(taskHtmlSelects[j].name+" -- "+taskHtmlSelects[j].value);
    }
  };*/

  $rootScope.submitTaskForm = function(instanceTaskId) {
    var taskIFrame = document.getElementById("TaskForm-"+instanceTaskId);
    var gwtframes = $rootScope.getIFrameDocument(taskIFrame).getElementsByClassName("gwt-Frame");
    var taskHtmlForm = $rootScope.getIFrameDocument(gwtframes[0]).getElementsByTagName("form")[0];

    try {
      //console.log("submitting taskHtmlForm");
      taskHtmlForm.submit();
    } catch (er) {
      console.log("failed to submit taskHtmlForm...");
      console.log(er.stack);
    }
  };

  $rootScope.completeTask = function(mission, instanceTask) {
    //console.log("completeTask for "+instanceTask.name);
    //$rootScope.submitTaskForm(instanceTask._id);
    ecsService.completeTask(instanceTask._id).success(function(responseData) {
      //console.log(JSON.stringify(responseData));
      $rootScope.updateMissions();
    });
  };
  $rootScope.getIFrameDocument = function(i) {
    try {
      return i.contentWindow ? i.contentWindow.document :
          i.contentDocument ? i.contentDocument : i.document;
    }catch (e) {
      console.log(e.stack);
    }
    return null;
  };
  $rootScope.instanceRoleExists = function(piid, raid, uid) {
    for (var i = 0; i < $rootScope.instanceRoles.length; i++) {
      var ir = $rootScope.instanceRoles[i];
      if (ir.processInstanceId == piid && ir.roleAssignmentId == raid && ir.userId == uid) {
        return true;
      }
    }
    return false;
  };

  $rootScope.addMission = function(usableMission) {
    $rootScope.missions.push(usableMission);
    $rootScope.sortMissions();
  };

  $rootScope.sortMissions = function() {
    $rootScope.missions.sort(function(a, b) {
      // if you have a processInstace, you'll have a startTime, so no need to check for it
      if (!!a.processInstance) {
        if (!!b.processInstance) {
          // check for stopTimes
          if (!!a.processInstance.stopTime && !b.processInstance.stopTime) { return -1; }
          if (!a.processInstance.stopTime && !!b.processInstance.stopTime) { return 1; }
          // if neither has a stopTime (or both do) then look at the startTime
          if (a.processInstance.startTime < b.processInstance.startTime) { return -1; }
          if (a.processInstance.startTime > b.processInstance.startTime) { return 1; }
          return 0;
        }
        // if a has a processInstance but b does not then b is unstarted
        return -1;
      } else if (!!b.processInstance) { return 1; }
      // otherwise sort by name
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
  };

  $rootScope.updateMissions = function() {
    //console.log("updateMissions begins...");
    if (!!$rootScope.updateMissionsPromise) {
      //console.log("cancel updateMissions timeout");
      $timeout.cancel($rootScope.updateMissionsPromise);
    }
    //   get the missions
    ecsService.getMissions().success(function (missionsData) {
      var oldMissionsById = $rootScope.getMissionsById();

      $rootScope.missions = [];
      //console.log("updateMissions getMissions analyzes "+missionsData.length+" fetched missions");

      // loop over the missions and try getting PIs with each missionId
      for (var j = 0; j < missionsData.length; j++) {
        //console.log("check on PIs for mission "+missionsData[j].name);
        var oldMission = oldMissionsById[missionsData[j]._id];
        if (!oldMission || (!oldMission.time && !!missionsData[j].time) || oldMission.time < missionsData[j].time ) {
          console.log("need to update "+missionsData[j].name+", old time: "+(!!oldMission&&!!oldMission.time?oldMission.time:"null")+", new time: "+(missionsData[j].time));
          $rootScope.updateProcessInstancesFor(missionsData[j], $rootScope.addMission);
        } else {
          //console.log("skipping "+missionsData[j].name+", no need to update, old time: "+(!!oldMission&&!!oldMission.time?oldMission.time:"null")+", new time: "+(missionsData[j].time));
          $rootScope.missions.push(oldMission);
        }
      }
      $rootScope.sortMissions();
      $rootScope.updateMissionsPromise = $timeout(function () {
        //console.log("call updateMissions() from the success timeout");
        $rootScope.updateMissions();
      }, $rootScope.config.ecsUpdateInterval);

    })/*.failure(function (err) {
      console.log("failed to retrieve missions for exercise "+$rootScope.selectedExercise.name);
      // TODO set a timer to re-call updateMissions after failure?
      $timeout(function () {
        console.log("call updateMissions() from the success timeout");
        $rootScope.updateMissions();
      }, $rootScope.config.ecsUpdateInterval);
    })*/;
    //console.log("...updateMissions ends");


  };

  $rootScope.getMissionsById = function(optionalId) {
    // hash the missions
    var missions = {};
    var m = $rootScope.missions;
    for (var i = 0; i < m.length; i++) {
      missions[m[i]._id] = m[i];
    }
    // if !!optionalId, return just the requested mission
    if (!!optionalId) {
      return missions[optionalId];
    }
    // otherwise, return the whole map
    return missions;
  };

  $rootScope.updateProcessInstancesFor = function(mission, callback) {
    var isTrainer = $rootScope.selectedRole.assignment === "Trainer";

    // get the ProcessInstances for the mission
    ecsService.getProcessInstancesFor(mission._id).success(function(piData) {
      // if processInstances are 1to1 with missions then we can simplify this loop
      if (piData.length == 1) {
        //console.log("updating the processInstance "+piData[0].name);
        mission.processInstance = piData[0];

        // post our InstanceRole for this ProcessInstance
        if (!isTrainer && !$rootScope.instanceRoleExists(piData[0]._id, $rootScope.selectedRole._id, $rootScope.selectedUser._id)) {
          console.log("postInstanceRole for PI "+piData[0].name+", role "+$rootScope.selectedRole.role+", user "+$rootScope.selectedUser.info.name);
          ecsService.postInstanceRole(piData[0]._id, $rootScope.selectedRole._id, $rootScope.selectedUser._id).success(function (irData) {
            //console.log(JSON.stringify(irData));
            $rootScope.instanceRoles.push(irData[0]);
          }).error(function(r) {
            console.log(JSON.stringify(r));
          });
        }

        // get mission metrics and mets
        $rootScope.updateMissionMetricsFor(mission);
        fileManagementService.getFileListings($rootScope.selectedExercise.name, mission.name).success(function(listingsData) {
          var urlList = [];
          for (var b = 0; b < listingsData.length; b++) {
            urlList.push({
              "name": listingsData[b].name,
              "url": listingsData[b].url
            });
          }
          if (urlList.length === 0) {
            urlList.push({"name":"No files available"});
          }
          mission.fileListings = urlList;
          $rootScope.updateTasksFor(mission);
        }).error(function(badNews) {
          console.log(badNews);
          $rootScope.updateTasksFor(mission);
        });


        if (!!callback) {
          callback(mission);
        }
      } else if (isTrainer){
        if (!!callback) {
          callback(mission);
        }
      }
    });
  };

  $rootScope.updateMissionMetricsFor = function(mission) {
    mission.metrics = [];
    ecsService.getMissionMetricsFor(mission._id).success(function (missionMetricsData){
      for (var i = 0; i < missionMetricsData.length; i++) {
        $rootScope.updateMetsFor(missionMetricsData[i]);
        //console.log(mission.name+" has metric "+missionMetricsData[i]._id);
        mission.metrics.push(missionMetricsData[i]);
      }
    });
  };

  $rootScope.updateMetsFor = function(metric) {
    ecsService.getMetsFor(metric.metId).success(function (metsData) {
      if (metsData.length == 1) {
        metric.met = metsData[0];
        //console.log(JSON.stringify(metric.met));
      }
    });
  };

  $rootScope.updateTasksFor = function(mission) {
    var isTrainer = $rootScope.selectedRole.assignment === "Trainer";
    mission.tasks = [];
    //console.log("updating tasks for "+mission.name);
    // get the instanceTasks for the processInstanceId...
    ecsService.getInstanceTasksFor(mission.processInstance._id).success(function (instanceTaskData) {
      //console.log("INSTANCE_TASKS: "+JSON.stringify(instanceTaskData));
      for (var i = 0; i < instanceTaskData.length; i++) {
        var task = instanceTaskData[i];
        // trainer gets all tasks, otherwise only add if the roles match
        // TODO: PENDING(jdc): possible conflict on User? what happens if one trainee user starts a task:
        // TODO: do they own it? should another trainee NOT see that task?
        if (isTrainer || ((!task.role || task.role === '' || task.role === $rootScope.selectedRole.role) && !task.stopTime)) {
          $rootScope.updateInputOutputsFor(mission, task);
          mission.tasks.push(task);
        }
      }

      // now get unstarted tasks for the mission id if the mission hasn't been stopped
      if (!mission.processInstance.stopTime) {
        ecsService.getUnstartedTasksFor(mission._id).success(function (unstartedTaskData) {
          //console.log("UNSTARTED_TASKS: "+JSON.stringify(unstartedTaskData));
          for (var k = 0; k < unstartedTaskData.length; k++) {
            var utask = unstartedTaskData[k];
            // trainer gets all tasks, otherwise only add if the roles match
            if (isTrainer || (!utask.role || utask.role === '' || utask.role === $rootScope.selectedRole.role)) {
              $rootScope.updateInputOutputsFor(mission, utask);
              mission.tasks.push(utask);
            }
          }
          // now set the currentTask to tasks[0]
          //console.log("found "+mission.tasks.length+" tasks for mission "+mission.name);

          if (!!$rootScope.selectedMission && $rootScope.selectedMission.name === mission.name) {
            $rootScope.selectedMission = mission;
            if (mission.tasks.length > 0) {
              $rootScope.selectTask(mission.tasks[mission.tasks.length - 1]);
              if ($rootScope.selectedMissionOption !== 'Summary') {
                $rootScope.selectedTaskOption = $rootScope.selectedMission.selectedTask.name;
              } else {
                $rootScope.selectedMissionOption = 'Summary';
              }
            } else {
              delete $rootScope.selectedMission.selectedTask;
            }
          }
        });
      } else {
        // now set the currentTask to tasks[0]
        console.log("found "+mission.tasks.length+" tasks for mission "+mission.name);
        if (!!$rootScope.selectedMission && $rootScope.selectedMission.name === mission.name) {
          if (mission.tasks.length > 0) {
            $rootScope.selectTask(mission.tasks[mission.tasks.length - 1]);
          } else {
            delete $rootScope.selectedMission.selectedTask;
          }
          if ($rootScope.selectedMissionOption === 'Task') {
            $rootScope.selectedTaskOption = $rootScope.selectedMission.selectedTask.name;
          }
        }
      }
    });
  };

  $rootScope.getFileListing = function(mission, name) {
    for (var i = 0; !!mission.fileListings && i < mission.fileListings.length; i++) {
      if (mission.fileListings[i].name === name) {
        return mission.fileListings[i];
      }
    }
    return null;
  };

  $rootScope.updateInputOutputsFor = function(mission, task) {
    if (!task.input) {
      task.input = [];
    }
    if (task.input.length > 0) {
      for (var r = 0; r < task.input.length; r++) {
        if (!task.input[r].url) {
          var file = $rootScope.getFileListing(mission, task.input[r].name);
          task.input[r].url = file?file.url:null;
              //fileManagementService.downloadDataProduct($rootScope.selectedExercise.name, mission.name, task.name, task.inputs[r].name);
        }
      }
    }
    if (!task.output) {
      task.output = [];
    }
    if (task.output.length > 0) {
      for (var s = 0; s < task.output.length; s++) {

        if (!task.output[s].url) {
          var xfile = $rootScope.getFileListing(mission, task.output[s].name);
          task.output[s].url = xfile?xfile.url:null;
          //task.outputs[s]["url"] = fileManagementService.downloadDataProduct($rootScope.selectedExercise.name, mission.name, task.name, task.outputs[s].name);
          //task.outputs[s]["path"] = fileManagementService.getUploadDataProductPath($rootScope.selectedExercise.name, mission.name, task.name);
        }
      }
    }
    if (!!task.info && !!task.info.length) {
      for (var m = 0; m < task.info.length; m++) {
        if (task.info[m].inputOutput === 'input') {
          task.input.push(task.info[m]);
        } else {
          task.output.push(task.info[m]);
        }
      }
    }
    if (!!task.inputNames && !!task.inputNames.length) {
      for (var p = 0; p < task.inputNames.length; p++) {
        var yfile = $rootScope.getFileListing(mission, task.inputNames[p]);
        task.input.push({
          "name": task.inputNames[p],
          "description": task.inputNames[p],
          "url": yfile?yfile.url:null
          //"url": fileManagementService.downloadDataProduct($rootScope.selectedExercise.name, mission.name, task.name, task.inputNames[p])
        });
      }
    }
    if (!!task.outputNames && !!task.outputNames.length) {
      for (var q = 0; q < task.outputNames.length; q++) {
        var zfile = $rootScope.getFileListing(mission, task.outputNames[q]);
        task.output.push({
          "name": task.outputNames[q],
          "description": task.outputNames[q],
          "url": zfile?zfile.url:null
              //fileManagementService.uploadDataProduct("dest", "source", "inputStream")
              //fileManagementService.downloadDataProduct($rootScope.selectedExercise.name, mission.name, task.name, task.outputNames[q])
        });
      }
    }
    //console.log('update the task ins n outs');
    //console.log(JSON.stringify(task));
  };

  $rootScope.onTaskFileClick = function(taskFile) {
    if (!!taskFile.url) {
      // open url in new window
      $window.open(taskFile.url);
    } else {
      $rootScope.openFileDownloadModal(taskFile);
    }
  };

  $rootScope.openFileDownloadModal = function(taskFile) {
    $rootScope.selectedTaskFile = taskFile;
    $rootScope.modalInstance = $modal.open({
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'tasks/download.tpl.html'
    });
  };

  $rootScope.openFileUploadModal = function(taskOutput) {
    $rootScope.selectedTaskOutput = taskOutput;
    $rootScope.modalInstance = $modal.open({
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'tasks/upload.tpl.html'
    });
  };

  $rootScope.onDashboardIFrameLoad = function(iframeId) {
    var taskIFrame = document.getElementById(iframeId);
    var navbar = $rootScope.getIFrameDocument(taskIFrame).getElementsByClassName("navbar")[0];
    navbar.style.display='none';
    var containers = $rootScope.getIFrameDocument(taskIFrame).getElementsByClassName("container");
    containers[0].style.display='none';
    containers[2].style.display='none';
  };

  //console.log('...AppCtrl ends');
})

    .directive( 'dashboardIframeOnload', function() {
      return {
        scope: {
          callback: '&dashboardIframeOnload'
        },
        link: function(scope, element, attrs) {
          element.on('load', function() {
            return scope.callback();
          });
        }
      };
    })
;