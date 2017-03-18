(function(){
	angular.module('starter')
	.controller('VehiclesController',['$scope','$state','$rootScope','$ionicPopup','localStorageService','SocketService', VehiclesController]);
	
	function VehiclesController($scope,$state,$rootScope,$ionicPopup,localStorageService,SocketService){
		$scope.vehicleList = [];

		$scope.loadList = function(){
		    SocketService.emit('vehicles:loadList');
            SocketService.on('vehicles:loadComplete', function(data){
		        console.log('loading complete ' + data);
		        $scope.vehicleList = angular.fromJson(data);
            });
            SocketService.on('vehicles:loadError', function(data){
                console.log(data);
            });
            $rootScope.$broadcast('scroll.refreshComplete');
        };

		$scope.openVIN = function(data){
			console.log('Opening Vehicle Detail Popup');
			//Run Load Vehicle Info Here -- Db Query emit, on
			$scope.data = [{
			    'vin' : data
            }];
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
			var partScanPopup = $ionicPopup.confirm({
				title: 'Scan Tag',
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});
		};		
		
		$scope.openVehicleScan = function(){
			console.log('Opening Vehicle Scan Popup');
			var vehicleScanPopup = $ionicPopup.confirm({
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