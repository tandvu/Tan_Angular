angular.module( 'training-service.trainer', [
  'ui.router',
  'ui.bootstrap',
  'training-service.start'
])

  .config(function trainerConfig( $stateProvider , $urlRouterProvider) {
    //console.log("TrainerConfig begins...");
    $stateProvider.state( 'trainer', {
      url: '/trainer',
      views: {
        "main": {
          controller: 'TrainerCtrl',
          templateUrl: 'trainer/trainer.tpl.html'
        }
      },
      data:{ pageTitle: 'MSCO Trainer' }
    });
    $urlRouterProvider.when( '/overview', '/overview');
    $urlRouterProvider.when( '/systems', '/systems');
    $urlRouterProvider.otherwise( '/missions' );
    //console.log("...TrainerConfig ends");
  })

  .controller( 'TrainerCtrl', function TrainerCtrl( $scope, $rootScope ) {
    //console.log("TrainerCtrl begins...");

    // default to Missions
    $scope.selectedTrainerOption = $rootScope.trainerTemplates[1].name;

    $scope.selectTrainerOption = function(screenName) {
      $scope.selectedTrainerOption = screenName;
    };

    $scope.selectSummary = function() {
      $rootScope.selectedTaskOption = 'Summary';
      $rootScope.selectedMissionOption = 'Summary';
    };

    $scope.selectTask = function(task) {

      $rootScope.selectedMissionOption = 'Task';
      $rootScope.selectTask(task);
    };

    $scope.selectMission = function(missionName) {
      //console.log('local selectMission('+missionName+') begins');
      $rootScope.selectMission(missionName);
      $scope.selectSummary();
    };

    //console.log("...TrainerCtrl ends");
  })
;