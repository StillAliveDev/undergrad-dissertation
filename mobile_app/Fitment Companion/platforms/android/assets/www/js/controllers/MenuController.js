(function(){
	angular.module('starter')
	.controller('MenuController',['$scope','$state','localStorageService','SocketService', MenuController]);
	
	function MenuController($scope,$state,localStorageService,SocketService){
		
		$scope.goToHomeState = function(){
			$state.go('app.home');
		};
		$scope.goToVehiclesState = function(){
			$state.go('app.vehicles');
		};
		$scope.goToPartsState = function(){
			$state.go('app.parts');
		};
		$scope.doLogout = function(){
			//Server logout gubbins here
			$state.go('login');
		}
	}
	
})();