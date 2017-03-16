(function(){
	angular.module('starter')
	.controller('LoginController',['$scope','$rootScope','$state','localStorageService','SocketService', LoginController]);
	
	function LoginController($scope,$rootScope,$state,localStorageService,SocketService){

		$scope.login = function(username, password){
			//Send data to server
			var loginData = {
				'username' : username,
				'pass' : password
			};
			SocketService.emit('user:login', loginData);
		};
        SocketService.on('login:success', function(data){
        	// Print the data
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
	}
	
})();