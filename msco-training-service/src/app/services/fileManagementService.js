angular.module('training-service.services.fms', [])

/**
 * Creates the 'fileManagementService'
 */
.factory('fileManagementService', function ($http, $rootScope) {
  return {
    getUploadDataProductPath: function(exerciseName, missionName) {
      return '%2FExecution%2F'+exerciseName+'%2F'+missionName;
    } ,
    uploadDataProduct: function(fileName) {
      return $rootScope.config.fmsUrl+$rootScope.config.uploadPath+'name='+fileName+'&path='+this.getUploadDataProductPath($rootScope.selectedExercise.name, $rootScope.selectedMission.name);
    },
    downloadDataProduct: function(exerciseName, missionName, taskName, fileName) {
      return $rootScope.config.fmsUrl+$rootScope.config.downloadPath+exerciseName+'/'+missionName+'/'+taskName+'/'+fileName;
    },
    getFileListings: function(exerciseName, missionName) {
      var url = $rootScope.config.fmsUrl+$rootScope.config.downloadPath+exerciseName+'/'+missionName;
      return $http.get(url);
    }

  };
});

