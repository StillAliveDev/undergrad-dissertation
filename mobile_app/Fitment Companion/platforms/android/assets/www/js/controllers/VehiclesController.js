(function(){
	angular.module('starter')
	.controller('VehiclesController',['$scope','$state','localStorageService','SocketService', VehiclesController]);
	
	function VehiclesController($scope,$state,localStorageService,SocketService){
		var me = this;
	}
	
})();