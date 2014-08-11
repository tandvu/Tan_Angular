angular.module( 'training-service.upload', [
  'ui.router',
  'ui.bootstrap',
  'training-service.services.conf',
  'training-service.services.ecs',
  'training-service.services.fms',
  'angularFileUpload'
])

.controller( 'UploadCtrl', function UploadCtrl( $scope, $rootScope, $upload, ecsService, fileManagementService, getConfigurationService) {//, $modalInstance ) {

  $scope.formNotReady = true;
  //$scope.uploadInProgress = false;

  $scope.onFileSelect = function($files) {
    $scope.files = $files;
    $scope.formNotReady = false;
  };

  $scope.submitUpload = function() {
    //$scope.uploadInProgress = true;

    /*for (var key in $scope.files[0]) {
      console.log(key + " -- " + $scope.files[0][key]);
    }*/

    // submit upload
    $scope.upload = $upload.upload({
      url: fileManagementService.uploadDataProduct($rootScope.selectedTaskOutput.name),//$scope.files[0].file_name),
      method: 'POST',
      file: $scope.files[0]
    }).progress(function(evt) {
      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total, 10));
    }).success(function(data, status, headers, config) {
      // file is uploaded successfully
      console.log(data);
      console.log($rootScope.selectedMission.selectedTask._id);

      $rootScope.selectedTaskOutput.url = data.url;
      console.log(JSON.stringify($rootScope.selectedMission.selectedTask));
      ecsService.putInstanceTask($rootScope.selectedMission.selectedTask).success(function() {
        $rootScope.updateMissions();
      });

      //$scope.uploadInProgress = false;
      $rootScope.modalInstance.close(true);
    }).error(function(data) {
      console.log(data);
    });
  };

  $scope.cancelUpload = function() {
    if (!!$scope.upload) {
      $scope.upload.abort();
    }
    $rootScope.modalInstance.close(true);
  };

})

;
