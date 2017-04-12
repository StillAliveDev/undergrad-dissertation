'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ui.bootstrap',
  'ngRoute',
  'btford.socket-io',
  'myApp.socket',
  'myApp.login',
  'myApp.home',
  'myApp.vehicles',
  'myApp.parts',
  'myApp.users',
  'myApp.fitments',
  'myApp.addUser',
  'myApp.addVehicle',
  'myApp.addPart',
  'myApp.addFitment',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
