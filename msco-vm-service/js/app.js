'use strict';

/* App Module */

var managerApp = angular.module('managerApp', [
  'ngRoute',
  'managerControllers',
  'managerServices'
]);

managerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/templates', {
        templateUrl: 'partials/template-list.html',
        controller: 'TemplateListCtrl'
      }).
      when('/exerciseListManager', {
        templateUrl: 'partials/exercise-list-manager.html',
        controller: 'TemplateListCtrl'
      }).
      when('/viewer', {
        templateUrl: 'partials/viewer.html',
        controller: 'TemplateListCtrl'
      }).
      otherwise({
        redirectTo: '/exerciseListManager'
      });
  }]);
