angular.module( 'metsDirective', [
])

.directive('mets', function() {
    return {
        restrict: 'E',
        templateUrl: 'missions/directives/mets/mets.tpl.html',
        link: function(scope, element, attr) {
            try {
                scope.mets = JSON.parse(attr.statuses);
            } catch (e) {
                element.replaceWith('N/A');
            }
        }
    };
});