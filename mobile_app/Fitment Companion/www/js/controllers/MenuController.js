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

		$scope.errorWarningShown = false;

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

        SocketService.on('connect_error', function(err){
            console.log('Failed Connection');
            if(!$scope.errorWarningShown){
            	$scope.errorWarningShown = true;
            	$scope.ep = $ionicPopup.alert({
					title: 'Error',
					template: '<p style="text-align: center;">Connection to the server was lost <strong>Please wait...</strong></p>',
					buttons:[]
				});
			}
        });
        SocketService.on('reconnect', function(){
            console.log('Reconnected');
            if($scope.errorWarningShown){
            	$scope.errorWarningShown = false;
                $scope.ep.close();
            	var cp = $ionicPopup.alert({
					title: 'Connection Re-established',
					template:'<p style="text-align:center;">Connection to the server was restablished</p>'
				});
			}
        })
	}
	
})();