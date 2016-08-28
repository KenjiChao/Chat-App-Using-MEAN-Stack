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
      controller: 'chatCtrl'
    })
    .state('template', {
      url: '/template',
      templateUrl: 'template.html'
    });

  $urlRouterProvider.otherwise('/');
}]);

app.factory('currentUser', function() {
  var o = {
    name: 'Kenji Chao'
  };
  return o;
});

app.factory('messages', function() {
  var data = {
    messages:[
      {user: "Kenji Chao", time: new Date(), text: "How are you?"},
      {user: "Jessica", time: new Date(), text: "Great!!"}
    ]
  };
  return data;
});

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

app.controller('mainCtrl', 
function($scope, $state, currentUser){
  $scope.title = "Real Time Chat Application";
  $scope.description = "Please enter your name";
  $scope.enterRoom = function() {
    currentUser.name = $scope.username;
    $state.go('chat');
  };
});

app.controller('chatCtrl',
function($scope, currentUser, messages, socket){
  socket.on('send message', function(msg){
    $scope.messages.push(msg);
  });

  $scope.username = currentUser.name;
  $scope.messages = messages.messages;
  $scope.send = function(){
    if(!$scope.message || $scope.message === '') { return; }
    socket.emit('send message', {
      user: currentUser.name,
      time: new Date(),
      text: $scope.message
    });
    $scope.message = '';
  };
});
