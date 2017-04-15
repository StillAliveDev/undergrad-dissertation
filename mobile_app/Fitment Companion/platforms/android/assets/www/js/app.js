/**
 * Main app module ('starter'), used to set up the application routes for each page.
 *
 * Ionic : UI CSS and Javascript module for the application to mimic a native application
 * btford.socket-io: Module for realtme socket communications with the serverside
 *
 * Application written by Luke Hussey 13015406 for the Individual Project Module
 * For use with 'Fitment Companion Serverside' and 'Fitment Companion Web'
 */
angular.module('starter', ['ionic', 'LocalStorageModule', 'btford.socket-io','angularMoment'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

  	//Cordova restrictions and behaviour
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
//Main application configuration
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
	$ionicConfigProvider.views.transition('none');
	$stateProvider
	.state('app',{ //This module
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'MenuController' //Menu controller for all navigation links. Defines the controller for the side menus
	})
	.state('login',{ //Login state
		url: '/login',
		templateUrl: 'templates/login.html', //Login page
		controller: 'LoginController' //Controller for the login screen logic
	})
	.state('app.home',{ //Home screen
		url: '/home',
		views: { //Nested controller: So that the menu is available on every page
			'menuContent': {
				templateUrl: 'templates/home.html', //HTML template
				controller: 'HomeController' // Home screen controller for logic
			}
		}
	})
	.state('app.vehicles',{ //Vehicles State
		url: '/vehicles',
		views: {
			'menuContent': {
				templateUrl: 'templates/vehicles.html', //Vehicles list HTML Template
				controller: 'VehiclesController' //VehiclesController for logic for this page
			}
		}
	})
	.state('app.parts',{ // Parts state
		url: '/parts',
		views:{
			'menuContent':{
				templateUrl: 'templates/parts.html',//Parts List HTML Template
				controller: 'PartsController' //Parts controller for the logic for this screen
			}
		}
	});
	//Default state to load when an unknown url is used
	//Its use in a mobile application is questionable, as there is no address bar though.
	$urlRouterProvider.otherwise('/login');
	
});
