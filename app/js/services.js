'use strict';

angular.module('dsapi.services', [], ['$provide', function($provide) {
  $provide.factory('dsapiDatasets', ['$http', '$q', function($http, $q) {
    var datasets = new DatasetList();
    var deferred = $q.defer();
    var service = {
      count: function() {
        return datasets.count();
      },
      all: function() {
        return datasets.all();
      },
      latest: function() {
        return datasets.latest();
      },
      get: function(index) {
        return datasets.get(index);
      },
      by_uuid: function(uuid) {
        return datasets.get_by_uuid(uuid);
      }
    };

    /* initialize datasets list */
    $http.get('/api/datasets')
      .success(function(data) {
        datasets.pushMany(data);

        /* resolve service instance */
        deferred.resolve(service);
      })
      .error(function(data, status, headers, config) {
        if (status == 404) {
          $http.get('/datasets')
          .success(function(data) {
            datasets.pushMany(data);

            /* resolve service instance */
            deferred.resolve(service);
          });
        } else {
          /* reject service instance */
          deferred.reject('Error loading datasets list.');
        }
      });

    return deferred.promise;
  }]);
}]);
