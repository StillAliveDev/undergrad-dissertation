(function(){
	angular.module('starter')
	.controller('LoginController',['$scope','$state','localStorageService','SocketService', LoginController]);
	
	function LoginController($scope,$state,localStorageService,SocketService){
		$scope.login = function(username, password){
			//Server Login Gubbins goes here
			
			console.log('Username: ' + username + ' Password: ' + password);
			
			//Load the main screen state
			$state.go('app.home');
		};
	}
	
})();