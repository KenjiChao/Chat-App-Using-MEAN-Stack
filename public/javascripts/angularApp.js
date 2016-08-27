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

app.controller('mainCtrl', 
function($scope, $state, currentUser){
  $scope.title = "Real Time Chat App";
  $scope.description = "Please enter your name";
  $scope.enterRoom = function() {
    currentUser.name = $scope.username;
    $state.go('chat');
  };
});

app.controller('chatCtrl',
function($scope, currentUser){
  $scope.title = "Chat Room";
  $scope.username = currentUser.name;
});
