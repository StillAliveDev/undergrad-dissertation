(function(){
	angular.module('starter')
	.controller('HomeController',['$scope','$state','localStorageService','SocketService', HomeController]);
	
	function HomeController($scope,$state,localStorageService,SocketService){
		var me = this;
	}
	
})();