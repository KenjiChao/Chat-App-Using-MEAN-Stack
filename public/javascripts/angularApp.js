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
  var socket = io.connect();
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

app.factory('api', function($http, $state) {
  var api = {
    user: { name: 'Kenji Chao', existed: false },
    messages: []
  };
  api.findUserByName = function() {
    return $http.get('/users/' + api.user.name)
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
function($scope, api, socket){
  socket.on('send message', function(message){
    $scope.messages.push(message);
  });

  $scope.user = api.user;
  $scope.messages = api.messages;
  $scope.send = function(){
    var e = angular.element(document.querySelector('#keep-bottom'));
    e.scrollTop = e.scrollHeight;
    if(!$scope.message || $scope.message === '') { return; }
    var message = {
      content: $scope.message,
      user: api.user.user
    };
    socket.emit('send message', message);
    api.saveMessage(message);
    $scope.message = '';
  };
});
