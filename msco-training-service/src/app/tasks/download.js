angular.module( 'training-service.download', [
  'ui.router',
  'ui.bootstrap',
  'training-service.services.conf',
  'training-service.services.ecs',
  'training-service.services.fms'
])

.controller( 'DownloadCtrl', function DownloadCtrl( $scope, $rootScope, ecsService, fileManagementService, getConfigurationService) {//, $modalInstance ) {


  $scope.close = function() {
    $rootScope.modalInstance.close(true);
  };
})
;
