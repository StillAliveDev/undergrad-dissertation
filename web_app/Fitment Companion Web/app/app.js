/**
 * Main app module for the Fitment Companion Web Applicaton.
 * Written by Luke Hussey 13015406 for the Individual Project Module
 * To be used in conjunction with the 'Fitment Companion' Mobile app and 'Fitment Companion Serverside'
 *
 * Each module is given a unique name, and added as a dependency here.
 */
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
