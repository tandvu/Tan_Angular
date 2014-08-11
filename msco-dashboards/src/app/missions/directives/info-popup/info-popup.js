var infoPopupDirective = angular.module( 'infoPopupDirective', [
    'ui.bootstrap.modal'
])

.directive('infoPopup', ['$parse',
    function($parse) {
        return {
            restrict: 'E',
            template: '<button class="btn btn-primary infoBtn fa fa-info"></button>',
            link: function(scope, element, attr) {
                element.on("click", function(event) {
                    scope.open(attr.title, attr.size, attr.data);
                });
            }
        };
}])

;