(function(){
	angular.module('starter')
	.controller('VehiclesController',['$scope','$state','$ionicPopup','localStorageService','SocketService', VehiclesController]);
	
	function VehiclesController($scope,$state,$ionicPopup,localStorageService,SocketService){
		var me = this;
		$scope.openVIN = function(vin){
			console.log('Opening Vehicle Detail Popup');
			var vehiclePopup = $ionicPopup.confirm({
				title: 'Selected Vehicle',
				templateUrl: 'templates/vehicleDetailModal.html',
				scope: $scope
			});
		};
		
		$scope.openGroup = function(group){
			console.log('Opening Group Detail Popup');
			var groupPopup = $ionicPopup.confirm({
				title: 'Fitment Detail',
				templateUrl: 'templates/fitmentGroupDetailModal.html',
				scope: $scope,
				okText: 'Start'
			});
		};
		
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
		
		$scope.openVehicleScan = function(){
			console.log('Opening Vehicle Scan Popup');
			var partPopup = $ionicPopup.confirm({
				title: 'Scan Tag',
				templateUrl: 'templates/vehicleScanModal.html',
				scope: $scope
			});
		};
		
		$scope.randomPrint = function(){
			console.log('hello world');
		};
		
	}
	
})();