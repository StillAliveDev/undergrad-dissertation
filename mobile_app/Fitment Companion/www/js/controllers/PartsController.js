(function(){
	angular.module('starter')
	.controller('PartsController',['$scope','$state','localStorageService','SocketService', PartsController]);
	
	function PartsController($scope,$state,localStorageService,SocketService){
		var me = this;
	}
	
})();