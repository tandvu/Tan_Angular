angular.module( 'training-service.trainee', [
  'ui.router',
  'ui.bootstrap',
  'training-service.start'
])

  .config(function traineeConfig( $stateProvider ) {
    //console.log("TraineeConfig begins...");
    $stateProvider.state( 'trainee', {
      url: '/trainee',
      views: {
        "main": {
          controller: 'TraineeCtrl',
          templateUrl: 'trainee/trainee.tpl.html'
        }
      },
      data:{ pageTitle: 'MSCO Trainee' }
    });
    //console.log("...TraineeConfig ends");
  })

  .controller( 'TraineeCtrl', function TraineeCtrl( $scope, $rootScope, $location, $modal ) {

  })
;