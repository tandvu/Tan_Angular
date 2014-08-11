var angularListboxSelect = function() {

	return {
		restrict: 'AE',	// Bind to attribute and elements
		scope: {
		 	listItems: "=",		// Pass 'list-items' property from parent scope to the isolated scope
			listResults: "=",	// Pass 'list-results' property from parent scope to the isolated scope
		 	itemsHeader: "=",
			resultsHeader: "="
		},
		templateUrl: '/javascripts/angular-listbox-select.html',
		link: function($scope, elem, attr) {
			$scope.selectableItems = [];
			$scope.selectedItems = [];


			// Check to see if the supplied items are already in the output model.
			// Store a reference in the proper selected/selectable tracking list
			angular.forEach($scope.listItems, function(value){
				if($scope.listResults.indexOf(value) > -1) {
					$scope.selectedItems.push({
						selected: false,
						value: value
					});
				}
				else {
					$scope.selectableItems.push({
						selected: false,
						value: value
					});
				}
			});

			$scope.$watch("listItems", function() {
				$scope.selectableItems = [];
				$scope.selectedItems = [];

				angular.forEach($scope.listItems, function(value){
					if($scope.listResults.indexOf(value) > -1) {
						$scope.selectedItems.push({
							selected: false,
							value: value
						});
					}
					else {
						$scope.selectableItems.push({
							selected: false,
							value: value
						});
					}
				});
			}, true);

			$scope.$watch("listResults", function() {
				$scope.selectableItems = [];
				$scope.selectedItems = [];

				angular.forEach($scope.listItems, function(value){
					if($scope.listResults.indexOf(value) > -1) {
						$scope.selectedItems.push({
							selected: false,
							value: value
						});
					}
					else {
						$scope.selectableItems.push({
							selected: false,
							value: value
						});
					}
				});
			}, true);

			// If and when the selected items change extract the values and set those values to the output model.
			$scope.$watch("selectedItems", function(newValue) {
				$scope.listResults = [];
				angular.forEach($scope.selectedItems, function(value){
					$scope.listResults.push(value.value);
				});
			}, true);

			// Generic function to move items from one array to another to avoid code duplication
			function moveSelectedItems(source, destination) {
				for(var i = source.length - 1; i >= 0; i--) {
					if(source[i].selected) {
						destination.push({
							selected: false,
							value: source[i].value
						});

						source.splice(i, 1);
					}
				}
			}

			// Move the selected items to the selected list
			$scope.insertItems = function() {
				moveSelectedItems($scope.selectableItems, $scope.selectedItems);
			}

			// Move the selected items to the selectable list
			$scope.removeItems = function() {
				moveSelectedItems($scope.selectedItems, $scope.selectableItems);
			}
		}
	};
}