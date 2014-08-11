angular.module('training-service.services.ecs', [])

.factory('ecsService', function ($http, $rootScope) {
  return {
    postCollection: function(collectionPath, collection) {
      var url = $rootScope.config.fveUrl+collectionPath;
      return $http.post(url, JSON.stringify(collection));
    },
    postInstanceRole: function(piid, raid, uid) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveInstanceRolesPath+$rootScope.selectedExercise.name;
      var payload = JSON.stringify({"processInstanceId":piid,"roleAssignmentId":raid,"userId":uid});
      return $http.post(url, payload);
    },
    getExercises: function() {
      var url = $rootScope.config.ecsUrl+$rootScope.config.ecsExercisesPath;
      return $http.get(url);
    },
    getCollection: function(path, query) {
      return this.getCollectionFor($rootScope.selectedExercise.name, path, query);
    },
    getCollectionFor: function(exerciseName, path, query) {
      var url = $rootScope.config.fveUrl+path+exerciseName;
      if (!!query) {
        url += query;
      }
      //console.log('getCollection from '+url);
      return $http.get(url);
    },
    getMissionMetricsFor: function(missionId) {
      return this.getCollection($rootScope.config.fveMissionMetricsPath, "?missionId="+missionId);
    },
    getMetsFor: function(metId) {
      return this.getCollection($rootScope.config.fveMetsPath, "?_id="+metId);
    },
    getInstanceRoles: function() {
      return this.getCollection($rootScope.config.fveInstanceRolesPath);
    },
    getRoleAssignments: function() {
      return this.getCollection($rootScope.config.fveRoleAssignmentsPath);
    },
    getMissions: function() {
      return this.getCollection($rootScope.config.fveMissionsPath);
    },
    getProcessInstances: function() {
      return this.getCollection($rootScope.config.fveProcessInstancesPath);
    },
    getProcessInstancesFor: function(missionId) {
      return this.getCollection($rootScope.config.fveProcessInstancesPath, "?missionId="+missionId);
    },
    getUnstartedTasksFor: function(missionId) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveUnstartedTasksPath+$rootScope.selectedExercise.name+"/"+missionId;
      //console.log("getUnstartedTasksFor should come from "+url+" rather than canned assets/unstartedTasks.json");
      //url = 'assets/unstartedTasks.json';
      return $http.get(url);
    },
    getInstanceTasksFor: function(processInstanceId) {
      return this.getCollection($rootScope.config.fveInstanceTasksPath, "?processInstanceId="+processInstanceId);
    },
    getInstanceVariablesFor: function(processInstanceId) {
      return this.getCollection($rootScope.config.fveInstanceVariablesPath, "?processInstanceId="+processInstanceId);
    },
    getUsers: function() {
      return this.getCollection($rootScope.config.fveUsersPath);
    },
    getUserFor: function(username) {
      return this.getCollection($rootScope.config.fveUsersPath, "?info.name="+username);
    },
    startMission: function(missionId) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveStartMissionPath+$rootScope.selectedExercise.name+'/'+missionId;
      //console.log("startMission using "+url);
      return $http.post(url);
    },
    stopMission: function(missionId) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveStopMissionPath+$rootScope.selectedExercise.name+'/'+missionId;
      //console.log("stopMission using "+url);
      return $http.post(url);
    },
    startTask: function(missionId, pesTaskId) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveStartTaskPath+$rootScope.selectedExercise.name+'/'+missionId+'/'+pesTaskId;
      //console.log("startTask using "+url);
      return $http.post(url);
    },
    completeTask: function(instanceTaskId) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveCompleteTaskPath+$rootScope.selectedExercise.name+'/'+instanceTaskId;
      console.log("completeTask using "+url);
      return $http.post(url);
    },
    /*getTaskForm: function(instanceTaskId) {
     var url = $rootScope.config.fveUrl+$rootScope.config.fveTaskFormPath+$rootScope.selectedExercise.name+'/'+instanceTaskId;
     console.log("getTaskForm using "+url);
     return $http.get(url);
     },*/
    getTaskFormUrl: function(instanceTaskId) {
      return $rootScope.config.fveUrl+$rootScope.config.fveTaskFormPath+$rootScope.selectedExercise.name+'/'+instanceTaskId;
    },
    putInstanceTaskUser: function(instanceTask, userName) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveInstanceTasksPath+$rootScope.selectedExercise.name+'/'+instanceTask._id;
      instanceTask.user = userName;
      delete instanceTask._id;
      return $http.put(url, JSON.stringify(instanceTask));
    },
    putInstanceTask: function(instanceTask) {
      var url = $rootScope.config.fveUrl+$rootScope.config.fveInstanceTasksPath+$rootScope.selectedExercise.name+'/'+instanceTask._id;
      delete instanceTask._id;
      delete instanceTask.$$hashKey;
      for (var i = 0; i < instanceTask.input.length; i++) {
        delete instanceTask.input[i].$$hashKey;
      }
      for (var j = 0; j < instanceTask.output.length; j++) {
        delete instanceTask.output[j].$$hashKey;
      }
      return $http.put(url, JSON.stringify(instanceTask));
    },
    loginToJbpm: function() {
      var url = $rootScope.config.jbpmUrl+$rootScope.config.jbpmRestDeploymentPath;
      console.log("loginToJbpm "+url);
      $http({ method: 'GET', url : url, headers: {
        "Authorization": "Basic "+btoa($rootScope.config.jbpmUsername+":"+$rootScope.config.jbpmPassword)//,
      }}).success(function(data, status) {
        console.log("logged in to jbpm, "+status);
      }).error(function(data, status, headers, config) {
        console.log("failed to login to jbpm, "+status+", "+JSON.stringify(data));
      });
    }

  };
});