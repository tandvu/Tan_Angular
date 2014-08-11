angular.module('training-service.services.conf', [])
/**
 * Creates the 'getConfigurationService', with one function 'getConfig' that loads up /assets/config.json.
 */
.factory('getConfigurationService', function ($http) {
  return {
    getConfig: function() {
      var url ='assets/config.json';
      return $http.get(url);
    }
  };
})
;