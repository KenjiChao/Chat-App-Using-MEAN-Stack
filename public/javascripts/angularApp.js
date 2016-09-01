var app = angular.module('realTimeChatApp', ['ui.router']);


app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'main.html',
      controller: 'mainCtrl'
    })
    .state('chat', {
      url: '/chat',
      templateUrl: 'chat.html',
      controller: 'chatCtrl',
      resolve: {
        postPromise: ['api', function(api){
          return api.getMessages();
        }]
      }
    })
    .state('template', {
      url: '/template',
      templateUrl: 'template.html'
    });

  $urlRouterProvider.otherwise('/');
}]);

// construct socket object
app.factory('socket', function ($rootScope) {
  var socket = io();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.factory('api', function($http, $state, socket) {
  var api = {
    user: { name: 'Guest', existed: false },
    messages: []
  };
  api.findUserByName = function() {
    return $http.get('/users/name/' + api.user.name)
              .success(function(data) {
                api.user.existed = true;
                api.user.user = data;
                $state.go('chat');
              })
              .error(function(data) {
                api.user.existed = false;
                api.createUser();
              });
  };
  api.createUser = function() {
    return $http.post('/users', {name: api.user.name}).success(function(data) {
      api.user.user = data;
      $state.go('chat');
    });
  };
  api.getMessages = function() {
    return $http.get('/messages').success(function(data) {
      angular.copy(data, api.messages);
    });
  };
  api.saveMessage = function(message) {
    return $http.post('/messages', message).success(function(data) {
      // api.messages.push(data);
      socket.emit('send message', data);
    });
  };
  return api;
});

app.controller('mainCtrl', 
function($scope, api){
  $scope.title = "Real Time Chat Application";
  $scope.description = "Please enter your name";
  $scope.enterRoom = function() {
    api.user.name = $scope.username;
    api.findUserByName();
  };
});

app.controller('chatCtrl',
function($scope, $state, $location, $anchorScroll, api, socket){
  socket.on('send message', function(message){
    $scope.messages.push(message);

    setTimeout(function() {
      $location.hash('panel-end');
      $anchorScroll();
    }, 10);
  });

  if (api.user.name == 'Guest') {
    $state.go('main');
  }

  $scope.user = api.user;
  $scope.messages = api.messages;
  $scope.send = function(){
    if(!$scope.message || $scope.message === '') { return; }
    var message = {
      content: $scope.message,
      user: api.user.user
    };
    api.saveMessage(message);
    $scope.message = '';
  };

  $location.hash('panel-end');
  $anchorScroll();
});
