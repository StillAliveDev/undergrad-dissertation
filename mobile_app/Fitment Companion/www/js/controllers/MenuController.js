(function(){
	angular.module('starter')
	.controller('MenuController',['$scope','$state','$ionicPopup','localStorageService','SocketService', MenuController]);
	
	function MenuController($scope,$state, $ionicPopup,localStorageService,SocketService){
		
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
		$scope.showFitmentModal = function(){
            console.log('Opening Group Detail Popup');
            var groupPopup = $ionicPopup.confirm({
                title: 'Fitment Detail',
                templateUrl: 'templates/fitmentGroupDetailModal.html',
				scope: $scope,
                okText: 'Start'
            });
		}

		//This is repeated code from VehiclesController... Do something about this
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
	}
	
})();