(function(){
	angular.module('starter')
	.controller('LoginController',['$scope','$rootScope','$state','$ionicPopup','SocketService', LoginController]);

    /**
	 * Constructor for he LoginController module
     * @param $scope: Controller Scope
     * @param $rootScope: Application scope - Share values between controllers
     * @param $state: Application state, used to navigate between pages
     * @param $ionicPopup: Ionic module to allow popups to be used in the application (Modals)
     * @param SocketService: Functions for realtime communications with the serverside
     * @constructor Constructor for the login HTML template
     */
	function LoginController($scope,$rootScope,$state, $ionicPopup,SocketService){

		//Runs checkNFCHardware as soon as application and template have loaded
		document.addEventListener("deviceReady", checkNFCHardware, false);

        /**
		 * Runs a check for the NFC hardware in the phone.
		 * If the NFC device is turned off, a popup is shown to the user
         */
		function checkNFCHardware(){
			console.log('Device Ready');
			nfc.enabled(function(){
				console.log('NFC Hardware Detected');
			},function(msg){
				var noNFCAlert = $ionicPopup.alert({ //Create the popup
					title:'NFC is not enabled',
					template:'Tap OK to open NFC settings'
				}).then(function(){
					nfc.showSettings(); //Opens the device settings for the NFC hardware.
				})
			})
		}

        /**
		 * Function to log the current user in. Makes a broadcast to the serverside
		 * with the username and password.
         * @param username
         * @param password
         */
		$scope.login = function(username, password){
            //Form the payload
			var loginData = {
				'username' : username,
				'pass' : password
			};
			//EMit a 'user:login' broadcast to log the user in
			SocketService.emit('user:login', loginData);
		};

		//Respond to the 'login:success' broadcast
        SocketService.on('login:success', function(data){
			$scope.loginFailed = false;
        	console.log(data);
        	var json = angular.fromJson(data); //Change JSON to Object type

			//Put user details into $rootScope -- sharable between controllers
        	$rootScope.user_id = json[0].user_id;
        	$rootScope.user_name = json[0].user_name;
        	//Call for the home screen data to load, small asynchronous issue here -- should be in HomeController
            SocketService.emit('home:load');
            $state.go('app.home'); // Go to the home state, load the HTML template for the home screen
        });

        //If the user login should fail
        SocketService.on('login:fail', function(data){
        	console.log(data);
        	$scope.loginFailed = true; //Display the HTML alert
		});
	}
	
})();