var todoApp = angular.module('todoApp', ['ngRoute', 'TodoApiClientPlugin']);

todoApp.config(['$routeProvider', function($routeProvider) {

  $routeProvider.
    when('/login', {
      templateUrl: '/templates/login.html',
      controller: 'LoginController'
    }).
    when('/signup', {
      templateUrl: '/templates/signup.html',
      controller: 'SignupController'
    }).
    when('/todos', {
      templateUrl: '/templates/todos.html',
      controller: 'TodosController'
    }).
    otherwise({
      redirectTo: '/login'
    });


}]);

todoApp.directive('datepciker', function() {

  return {
    restrict: 'EA',
    scope: {},
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return;
      
      ngModel.$render = function() {
        element.html(ngModel.$viewValue || '');
      };
      
      element.Zebra_DatePicker({
        direction: 1,
        format: 'Y-m-d',
        show_icon: false,
        onSelect: function(customFormat, defaultFormat, dateObject) {
          scope.$apply(function() {
            ngModel.$setViewValue(customFormat);
          });
        },
        onClear: function() {
          scope.$apply(function() {
            ngModel.$setViewValue(null);
          });
        }
      });
    }
  }

});

todoApp.controller('LoginController', function($scope, $location, TodoApiClient) {
  if (TodoApiClient.is_logged()) {
    $location.path('/todos');
    return;
  }
  
  $scope.login = function() {
    TodoApiClient.login($scope.email, $scope.password).then(function(data) {
      $location.path('/todos');
    }, function(data) {
      $scope.error = data.message;
    });
  };
  
  $scope.signup = function() {
    $location.path('/signup');
  };
});

todoApp.controller('SignupController', function($scope, $location, TodoApiClient) {
  if (TodoApiClient.is_logged()) {
    $location.path('/todos');
    return;
  }
  
  $scope.signup = function() {
    TodoApiClient.register($scope.email, $scope.password).then(function(data) {
      $location.path('/login');
    }, function(data) {
      $scope.errors = data.errors;
    });
  }
});

todoApp.controller('TodosController', function($scope, $location, TodoApiClient) {

  if (! TodoApiClient.is_logged()) {
    $location.path('/login');
    return;
  }
  
  $scope.editMode = [];
  
  $scope.editTodo = function(index) {
    $scope.editMode[index] = true;
  };
  
  $scope.saveTodo = function(index) {
    var todo = $scope.todos[index];
    TodoApiClient.updateTodo(todo.id, todo).then(function(data) {
      $scope.editMode[index] = false;
    }, function(data) {
      alert(data.message);
    });
  };
  
  $scope.deleteTodo = function(index) {
    var todo = $scope.todos[index];
    TodoApiClient.deleteTodo(todo.id).then(function(data) {
      $scope.todos.splice(index, 1);
    }, function(data) {
      alert('There was a problem in deleting the record: ' + data.message);
    });
  };
  
  $scope.setDone = function(index) {
    var todo = $scope.todos[index];
    TodoApiClient.updateTodo(todo.id, todo).then(function(data) {
    
    }, function(data) {
    
    });
  };
  
  $scope.logout = function() {
    TodoApiClient.logout().then(function() {
      $location.path('/login');
    }, function(data) {
      alert('Failed to logout: ' + data.message); 
    });
  }
  
  $scope.today = new Date();
  
  $scope.newTodo = {};

  $scope.createTodo = function() {
    TodoApiClient.createTodo($scope.newTodo).then(function(data) {
      refreshTodoList();
      $scope.newTodo = {};
      $scope.newTodo_errors = null;
    }, function(data) {
      $scope.newTodo_errors = data.errors;
    });
  };
  
  
  
  var refreshTodoList = function() {
    TodoApiClient.fetchTodos().then(function(data) {
      $scope.todos = data.todos;
    }, function(data) {
      console.log(data);
    });
  };
  
  refreshTodoList();
});
