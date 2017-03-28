angular.module('starter', ['ionic', 'LocalStorageModule', 'btford.socket-io','angularMoment'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
/*
  $rootScope.removeNFCListener = function(){
      nfc.removeNdefListener(
          nfcHandler, // this must be the same as the function above
          function () {
              console.log("Success, the listener has been removed.");
          },
          function (error) {
              alert("Removing the listener failed");
          }
      );
  };

  $rootScope.addNFCListener = function(){
      nfc.addNdefListener(
          nfcHandler,
          function(){
              console.log('Listening for a tag');
          },
          function(error){
              console.log('error adding listener');
          }
      );
  }*/
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
	$ionicConfigProvider.views.transition('none');
	$stateProvider
	.state('app',{
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'MenuController'
	})
	.state('login',{
		url: '/login',
		templateUrl: 'templates/login.html',
		controller: 'LoginController'
	})
	.state('app.home',{
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html',
				controller: 'HomeController'
			}
		}
	})
	.state('app.vehicles',{
		url: '/vehicles',
		views: {
			'menuContent': {
				templateUrl: 'templates/vehicles.html',
				controller: 'VehiclesController'
			}
		}
	})
	.state('app.parts',{
		url: '/parts',
		views:{
			'menuContent':{
				templateUrl: 'templates/parts.html',
				controller: 'PartsController'
			}
		}
	});
	
	$urlRouterProvider.otherwise('/login');
	
});
