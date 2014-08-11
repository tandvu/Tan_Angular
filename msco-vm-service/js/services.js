'use strict';

/* Services */

/* TODO: Currently not calling these services from the controller, but might want to switch back to using them in the future. If so, would need
 *   to update them. 
 */

var managerServices = angular.module('managerServices', ['ngResource']);

/*
managerServices.factory('Template', ['$resource',
  function($resource){
    return $resource('templates/:templateId.json', {}, {
      query: {method:'GET', params:{templateId:'servers'}, isArray:true}
    });
  }]);
*/

managerServices.factory('Template', ['$resource',
  function($resource){
    return $resource('/VirtualizationManager/user/ovfTemplates', {}, {
      query: {method:'GET', params:{}, isArray:true}
    });
  }]);

managerServices.factory('VM', ['$resource',
  function($resource){
    return $resource('/VirtualizationManager/user/virtualMachines', {}, {
      query: {method:'GET', params:{}, isArray:true}
    });
  }]);

managerServices.factory('DeployTemplate', ['$resource',
  function($resource){
    return $resource('/VirtualizationManager/admin/provisionVM/192.168.80.14/CentOS?uri=C:\\OVFs\\CentOS.ovf', {}, {
      query: {method:'PUT', params:{}}
    });
  }]);

managerServices.factory('StartVM', ['$resource',
  function($resource){
    return $resource('/VirtualizationManager/admin/startVM/:id', {}, {
      query: {method:'PUT', params:{id: '@id'}}
    });
  }]);
  
managerServices.factory('StopVM', ['$resource',
  function($resource){
    return $resource('/VirtualizationManager/admin/stopVM/:id', {}, {
      query: {method:'PUT', params:{id: '@id'}}
    });
  }]);
