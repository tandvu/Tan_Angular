angular.module( 'training-service.start', [
  'ui.router',
  'ui.bootstrap',
  'training-service.services.conf',
  'training-service.services.ecs'/*,
  'stacktrace'*/
])

    /*.config(function config( $stateProvider ) {
      $stateProvider.state( 'start', {
        url: '/start',
        views: {
          "main": {
            controller: 'StartCtrl',
            templateUrl: 'start/start.tpl.html'
          }
        },
        data:{ pageTitle: 'Select Exercise...' }
      });
    })*/

    .controller( 'StartCtrl', function StartCtrl( $scope, $rootScope, $location, $window, ecsService, getConfigurationService) {//, $modalInstance ) {
      //console.log("StartCtrl begins...");
      //var barf= new Error('who called StartCtrl?');
      //console.log(barf.stack);

      $scope.usersNotLoaded = true;
      $scope.rolesNotLoaded = true;
      $scope.formNotReady = true;
      $scope.exerciseItems = [{"name":"Loading, please wait..."}];
      $scope.formExercise = $scope.exerciseItems[0];
      $scope.userItems = [{ "info": {"name":"Loading, please wait..."}}];
      $scope.formUser = $scope.userItems[0];
      $scope.roleItems = [{"role":"Loading, please wait..."}];
      $scope.formRole = $scope.roleItems[0];
      //printStackTrace({e: barf});

      if (!$rootScope.config) {
        getConfigurationService.getConfig().success(function (data) {
          $rootScope.config = data._configurationdata;
          //console.log('start set rootscope ecsconfig to '+$rootScope.config+', now complete init');
          $scope.populateExercises();
        });
      } else {
        //console.log('rootscope ecsconfig already set, complete init');
        $scope.populateExercises();

      }

      $scope.populateExercises = function() {
        ecsService.getExercises().success(function (data) {
          if (!!data && data.length > 0) {
            $scope.exerciseItems = [
              {"name": "Select Exercise..."}
            ];
            for (var i = 0; i < data.length; i++) {
              $scope.exerciseItems.push(data[i]);
            }
          } else {
            $scope.exerciseItems = [{"name":"No Exercises available"}];
          }
          $scope.formExercise = $scope.exerciseItems[0];
        });
      };

      $scope.selectExercise = function() {
        if ($scope.formExercise.name != "Select Exercise..." && $scope.formExercise.name != "No Exercises available") {
          $rootScope.selectedExercise = $scope.formExercise;
          $rootScope.exerciseOverviewUrl = $rootScope.config.dashboardOverviewUrl.replace(':exerciseName', $rootScope.selectedExercise.name);
          $rootScope.exerciseSystemsUrl = $rootScope.config.dashboardSystemsUrl.replace(':exerciseName', $rootScope.selectedExercise.name);
          $scope.populateUsers();
          //$scope.populateRoles();
        }
      };

      $scope.populateUsers = function() {
        // we need to get the exercises first, so we can get all users
        // thank goodness this is junk code we will remove as soon as
        // we get the user from ldap

        /*$scope.userItems = [
          {"info" : { "name": "Select User..." }}
        ];
        var exercisesToProcess = 0;
        var userSuccess = function(userData) {
          exercisesToProcess--;
          for (var i = 0; i < userData.length; i++) {
            $scope.userItems.push(userData[i]);
          }
          if (exercisesToProcess === 0) {
            if ($scope.userItems.length == 1) {
              // no users were found
              $scope.userItems = [
                {"info": { "name": "No Users available..." }}
              ];
            }
            $scope.formUser = $scope.userItems[0];
          }
        };

        ecsService.getExercises().success(function(exerciseData) {
          console.log("looking through "+exerciseData.length+" exercises");
          for (var j = 0; j < exerciseData.length; j++) {
            exercisesToProcess++;
            console.log("...check exercise "+exerciseData[j].name);
            ecsService.getCollectionFor(exerciseData[j].name, $rootScope.config.fveUsersPath).success(userSuccess);
          }
        });*/

        ecsService.getUsers().success(function(userData) {
         if (!!userData && userData.length > 0) {
           $scope.userItems = [ {"info" : { "name": "Select User..." }} ];
           for (var i = 0; i < userData.length; i++) {
             $scope.userItems.push(userData[i]);
           }
           $scope.formUser = $scope.userItems[0];
           $scope.usersNotLoaded = false;
         } else {
           $scope.userItems = [ {"info" : { "name": "No Users available" }} ];
         }
        });

      };

      $scope.selectUser = function() {
        //console.log("selectUser form user is "+$scope.formUser.info.name);
        if ($scope.formUser.info.name != "Select User..." && $scope.formUser.info.name != "No Users available") {
          $rootScope.selectedUser = $scope.formUser;
          $scope.invalidUser = false;
          $scope.populateRoles();
        }
      };

      /*$scope.verifyUser = function() {
        ecsService.getUserFor($scope.formUser.info.name).success(function(userData) {
          if (userData.length == 1) {
            $rootScope.selectedUser = userData[0];
            $rootScope.invalidUser = false;
          } else {
            console.log("onUserChange() didn't find a user for "+$scope.formUser+", received "+userData);
          }
        });
      };*/


      $scope.populateRoles = function() {

        // get the exercise's current instanceRoles
        ecsService.getInstanceRoles().success(function (instanceRolesData) {
          $rootScope.instanceRoles = instanceRolesData;
        });

        // get the exercise's roleAssignments
        $scope.roleItems = { "role": "Loading, please wait..." };
        ecsService.getRoleAssignments().success(function (roleAssignmentData) {
          var roleListData = [
            { "role": "Select Role..." }
          ];
          var trainerFound = false;
          if (!!roleAssignmentData && roleAssignmentData.length > 0) {

            for (var j = 0; j < roleAssignmentData.length; j++) {
              if (roleAssignmentData[j].assignment != "Simulated Role") {
                roleListData.push(roleAssignmentData[j]);
              }
              if (roleAssignmentData[j].role === "Trainer") {
                trainerFound = true;
              }
            }
          } else {
            roleListData.push({ "role": "Trainee"});
          }
            // TODO: we should only add Trainer if the User has the Trainer role...perhaps do the same with VMAdmin?
            // if/when USER is known, also check against USER's group to see if USER is TRAINER, ADMIN, etc.
            if (!trainerFound) {
              roleListData.push({ "role": "Trainer", "assignment": "Trainer" });
            }
            roleListData.push({ "role": "VM Admin", "assignment": "VM Admin" });
            $scope.roleItems = roleListData;
            $scope.formRole = $scope.roleItems[0];
            $scope.rolesNotLoaded = false;
          /*} else {
            $scope.roleItems = [ { "role": "No Roles available" } ];
          }*/
        });
      };

      $scope.selectRole = function() {
        if ($scope.formRole.role != "Please select Exercise first..." && $scope.formRole.role != "Select Role...") {
          $rootScope.selectedRole= $scope.formRole;
          $scope.formNotReady = false;
        }
      };

      $scope.close = function() {
        //console.log("start closes with "+$scope.formUser.info.name+", "+$scope.formExercise.name+", "/*+$scope.formEvent.name+", "*/+$scope.formRole.role);

        if ($rootScope.selectedRole.assignment === "VM Admin") {
          //jump to the vm admin page
          //console.log("need to redirect to VM Admin at "+$rootScope.config.vmAdminUrl+$rootScope.selectedExercise.name);
          //$window.location = $rootScope.config.vmAdminUrl+$rootScope.selectedExercise.name;
          $location.path("virtualizationViewer");
        } else {

          ecsService.loginToJbpm();

          $rootScope.updateMissions();
          var isTrainer = $rootScope.selectedRole.assignment === "Trainer";
          //console.log("redirect to "+(isTrainer?"Trainer":"Trainee"));
          $location.path(isTrainer?"trainer":"trainee");
        }
        $rootScope.modalInstance.close(true);
      };
      //console.log("...StartCtrl ends");
    })

;
