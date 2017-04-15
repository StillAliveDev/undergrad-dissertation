(function(){
	angular.module('starter')
	.controller('MenuController',['$scope','$rootScope','$state','$ionicPopup','SocketService', MenuController]);
    /**
     * Constructor for the MenuController Module.
     * @param $scope: Contoller Scope
     * @param $rootScope: Application scope -- sharable between controllers
     * @param $state: Application state functions
     * @param $ionicPopup: Ionic UI Popup functions
     * @param SocketService: SocketSevice functions for realtime communication
     * @constructor MenuController for menu HTML template logic
     */
	function MenuController($scope,$rootScope, $state, $ionicPopup,SocketService){

        /**
         * Navigate the app to the Home state, load its HTML Template
         */
		$scope.goToHomeState = function(){
			$state.go('app.home');
		};

        /**
         * Navigate the app to the vehicles state, load its HTML template
         */
		$scope.goToVehiclesState = function(){
			$state.go('app.vehicles');
		};

        /**
         * Navigate to the arts state, load its HTML template
         */
		$scope.goToPartsState = function(){
			$state.go('app.parts');
		};

        /**
         * Log the current user out
         */
		$scope.doLogout = function(){
            var data = { //Payload
                userid : $rootScope.user_id,
                username : $rootScope.user_name
            };

            //Send the logout broadcast, with the JSON payload
            SocketService.emit('user:logout', angular.toJson(data));
			$state.go('login'); //Change state to Login, load its HTML template
		};
	}
	
})();