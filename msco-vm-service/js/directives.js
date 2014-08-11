'use strict';

/* Directives */

managerApp.directive('d3Visualization', function() {
    return {
        restrict: 'E',
        scope: {
            val: '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('val', function(newValue, oldValue) {
                if (newValue)
                    console.log("I see a data change!");
            }, true);
        }
    }
});