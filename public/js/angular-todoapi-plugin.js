var TodoApiClientPlugin = angular.module('TodoApiClientPlugin', []);

var TODO_API_URL = TODO_API_URL || 'http://api.local:9292';

TodoApiClientPlugin.config(function($httpProvider) {
  //Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;

  //Remove the header used to identify ajax call  that would prevent CORS from working
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

TodoApiClientPlugin.factory('TodoApiClient', function($http, $q) {
  var _token = null;
  
  function url_to(path) {
    return TODO_API_URL + '/api/v1' + path;
  }
  
  function is_successfull(status) {
    var status = status + '';
    return status.match(/^20[0-9]$/);
  }
  
  return {
    login: function(email, password) {
      var deferred = $q.defer();
      $http.post(url_to('/session'), {email: email, password: password})
        .success(function(data) {
          if (is_successfull(data.status)) {
            _token = data.token;
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          } 
        });
      return deferred.promise;
    },
    logout: function() {
      var deferred = $q.defer();
      $http.delete(url_to('/session?token=' + _token))
        .success(function(data) {
          _token = null;
          if (is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data); 
          }
        });
        
      return deferred.promise;
    },
    is_logged: function() {
      return !! _token;
    },
    register: function(email, password, success, error) {
      var deferred = $q.defer();
      
      $http.post(url_to('/users'), {email: email, password: password})
        .success(function(data) {
          if (is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        });
        
      return deferred.promise;
    },
    fetchTodos: function(options) {
      var deferred = $q.defer();
      var _defaults = {order: 'id', limit: 50, offset: 0};
      angular.extend(_defaults, options);
      $http.get(url_to(['/todos?token=', _token, '&order=', _defaults.order, '&limit=', _defaults.limit, '&offset=', _defaults.offset].join('')))
        .success(function(data) {
          if(is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        });
      
      return deferred.promise;
    },
    createTodo: function(todoObject) {
      var deferred = $q.defer();
      $http.post(url_to('/todos?token=' + _token), todoObject)
        .success(function(data) {
          if (is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        });
      
      return deferred.promise;
    },
    updateTodo: function(id, todo) {
      var deferred = $q.defer();
      $http.put(url_to('/todos/' + id + '?token=' + _token), todo)
        .success(function(data) {
          if (is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        });
      return deferred.promise;
    },
    deleteTodo: function(id) {
      var deferred = $q.defer();
      $http.delete(url_to('/todos/' + id + '?token=' + _token))
        .success(function(data) {
          if (is_successfull(data.status)) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        });
      return deferred.promise;
    }
  }
});
