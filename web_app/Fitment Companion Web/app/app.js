'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ui.bootstrap',
  'ngRoute',
  'myApp.socket',
  'btford.socket-io',
  'myApp.login',
  'myApp.home',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
