$(document).ready(function(){
	$("[data-toggle='tooltip']").tooltip();
});

var dashboardApp = angular.module('dashboardApp', []);

dashboardApp.directive("selectableList", angularListboxSelect);

function sortCollection(byProperty) {
	if(typeof(byProperty) === "undefined") {
		return function(a, b) {
			if(a.toLowerCase() < b.toLowerCase()) {
				return -1;
			}
			else if(a.toLowerCase() > b.toLowerCase()) {
				return  1;
			}
			else {
				return  0;
			}
		}
	}
	else {
		return function(a, b) {
			if(a[byProperty].toLowerCase() < b[byProperty].toLowerCase()) {
				return -1;
			}
			else if(a[byProperty].toLowerCase() > b[byProperty].toLowerCase()) {
				return  1;
			}
			else {
				return  0;
			}
		}
	}
}

dashboardApp.controller('ManagePermissionsController', function($scope, $http) {

	$scope.consumers 	= [];
	$scope.roles 		= [];
	$scope.databases	= [];
	$scope.access		= ["read", "manage"];

	$scope.selectableConsumerRoles 	= [];
	$scope.selectedConsumerRoles 	= [];

	$http
		.get("/service/consumer")
		.success(function(data) {
			data.sort(sortCollection("identifier"));
			$scope.consumers = data;
		});
				
	$http
		.get("/service/role")
		.success(function(data) {
			data.sort(sortCollection("name"));
			$scope.roles = data;
		});

	$http
		.get("/service/database")
		.success(function(data) {
			data.sort(sortCollection());
			$scope.databases = data;
		});


	$scope.$watchCollection("roles", function() {
		if($scope.selectedConsumer) {
			$scope.selectableConsumerRoles = $.map($scope.roles, function(value) { return value.name } );
			$scope.selectedConsumerRoles   = $.map(consumer.roles, function(value) { return value.name; });
		}
		else {
			$scope.selectableConsumerRoles = [];
			$scope.selectedConsumerRoles = [];
		}
	});

	$scope.$watch("selectedConsumer", function() {
		if($scope.selectedConsumer) {
			$scope.selectableConsumerRoles = $.map($scope.roles, function(value) { return value.name } );
			$scope.selectedConsumerRoles   = $.map($scope.selectedConsumer.roles, function(value) { return value.name; });
		}
		else {
			$scope.selectableConsumerRoles = [];
			$scope.selectedConsumerRoles = [];
		}
	}, true);

	$scope.$watch("selectedRole", function() {
		if($scope.selectedRole) {
			$scope.selectedDatabase = undefined;
			$scope.selectedDatabaseAccess = [];
		}
	}, true);

	$scope.$watch("selectedDatabase", function() {
		if($scope.selectedDatabase) {
			var db;

			for(var i = 0; i < $scope.selectedRole.databases.length; i++) {
				if($scope.selectedRole.databases[i].name === $scope.selectedDatabase) {
					db = $scope.selectedRole.databases[i]
				}
			}

			if(db) {
				$scope.selectedDatabaseAccess = db.access;
			}
			else {
				$scope.selectedDatabaseAccess = "";
			}
		}
		else {
			$scope.selectedDatabaseAccess = "";
		}
	}, true);

	$scope.$watchCollection("selectedConsumerRoles", function() {
		if($scope.selectedConsumer) {
			$http.put("/service/consumer/roles", {
				consumer: $scope.selectedConsumer.identifier,
				roles: $scope.selectedConsumerRoles
			});
		}
		else {
			$scope.selectableConsumerRoles = [];
			$scope.selectedConsumerRoles = [];
		}
	}, true);

	$scope.addConsumer = function(newConsumer) {
		$http
			.post("/service/consumer", { name: newConsumer })
			.success(function(data) {
				$scope.consumers.push(data);
				$scope.consumers.sort(sortByProperty("identifier"));
				$scope.newConsumer = "";
			});
	}				

	$scope.addRole = function(newRole) {
		$http
			.post("/service/role", { name: newRole })
			.success(function(data) {
				$scope.roles.push(data);
				$scope.roles.sort(sortByProperty("name"));
				$scope.newRole = "";
			});
	}

	$scope.updateDatabaseAccess	= function(databaseAccess) {
		$http.put("/service/role/databases", {
			role: $scope.selectedRole,
			database: $scope.selectedDatabase,
			access: databaseAccess
		});
	}
});