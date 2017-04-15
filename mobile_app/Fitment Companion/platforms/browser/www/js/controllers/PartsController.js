(function(){
	angular.module('starter')
	.controller('PartsController',['$scope','$state','$ionicPopup','localStorageService','SocketService', PartsController]);
	
	function PartsController($scope,$state,$ionicPopup,localStorageService,SocketService){
		var me = this;
		
		$scope.openPart = function(part){
			console.log('Opening Part Popup');
			var partPopup = $ionicPopup.confirm({
				title: 'Part Detail',
				templateUrl: 'templates/partDetailModal.html',
				scope: $scope
			});
		};
		
		$scope.openPartScan = function(){
			console.log('Opening Part Scan Popup');
			var partPopup = $ionicPopup.confirm({
				title: 'Scan Tag',
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});
		};
	}
	
})();