(function(){
	angular.module('starter')
	.controller('LoginController',['$scope','$rootScope','$state','$ionicPopup','localStorageService','SocketService', LoginController]);

	function LoginController($scope,$rootScope,$state, $ionicPopup, localStorageService,SocketService){
		SocketService.removeAllListeners();

		document.addEventListener("deviceReady", checkNFCHardware, false);

		function checkNFCHardware(){
			console.log('Device Ready');
			nfc.enabled(function(){
				console.log('NFC Hardware Detected');
			},function(msg){
				var noNFCAlert = $ionicPopup.alert({
					title:'NFC is not enabled',
					template:'Tap OK to open NFC settings'
				}).then(function(){
					nfc.showSettings();
				})
			})
		};

		$scope.login = function(username, password){
			//Send data to server
			var loginData = {
				'username' : username,
				'pass' : password
			};
			SocketService.emit('user:login', loginData);
		};
        SocketService.on('login:success', function(data){
			$scope.loginFailed = false;
        	console.log(data);
        	var json = angular.fromJson(data)

			//Put user details into $rootScope
        	$rootScope.user_id = json[0].user_id;
        	$rootScope.user_name = json[0].user_name;
            $state.go('app.home');
        });
        SocketService.on('login:fail', function(data){
        	console.log(data);
        	$scope.loginFailed = true;
		})
		SocketService.on('login:update', function(){

        	console.log('Someone logged in');
		});

        SocketService.on('timer:post', function(){
        	console.log('ping');
		})
	}
	
})();