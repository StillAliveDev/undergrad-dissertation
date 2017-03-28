(function(){
	angular.module('starter')
	.controller('VehiclesController',['$scope','$state','$rootScope','$ionicPopup','localStorageService','SocketService', VehiclesController]);
	
	function VehiclesController($scope,$state,$rootScope,$ionicPopup,localStorageService,SocketService){

		$scope.controllerData = {
			list : {
				vehicles:[],
				total:0,
				in_fitments:0
			},
			vehicleDetails : {},
			partDetails : {
                part: {}
            },

			partsScan:{
				toRemove:true
			}
		};


		$scope.loadList = function(){
		    SocketService.emit('vehicles:loadList');
            SocketService.on('vehicles:loadComplete', function(data){
		        console.log('loading complete ' + data);
		        $scope.controllerData.list = angular.fromJson(data);
		        SocketService.removeListener('vehicles:loadComplete');
            });
            SocketService.on('vehicles:loadError', function(data){
                console.log(data);
            });
            $rootScope.$broadcast('scroll.refreshComplete');
        };

		$scope.openVIN = function(vin){
			console.log('Opening Vehicle Detail Popup');
			$scope.getVehicleDetails(vin);
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
			$scope.partEnquiry(part);
			var partPopup = $ionicPopup.confirm({
				title: 'Part Detail',
				templateUrl: 'templates/partDetailModal.html',
				scope: $scope
			});
		};

		$scope.openPartScan = function(){
			console.log('Opening Part Scan Popup');

			if(contr)
			$scope.partScanPopup = $ionicPopup.confirm({
				title: "Remove Part",
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});

            nfc.addNdefListener(
                nfcHandler,
                function(){
                    console.log('Listening for a tag');
                },
                function(error){
                    console.log('error adding listener');
                }
            );
		};		
		
		$scope.openVehicleScan = function(){
			console.log('Opening Vehicle Scan Popup');
			$scope.vehicleScanPopup = $ionicPopup.confirm({
				title: 'Vehicle Enquire',
				templateUrl: 'templates/vehicleScanModal.html',
				scope: $scope
			});

            nfc.addNdefListener(
                nfcHandler,
                function(){
                    console.log('Listening for a tag');
                },
                function(error){
                    console.log('error adding listener');
                }
            );
		};


		$scope.partEnquiry = function(part){
            SocketService.emit('part:enquire',part);
            SocketService.on('part:enquirySuccess', function(data){
                console.log(data);
                $scope.controllerData.partDetails = angular.fromJson(data);
                SocketService.removeListener('part:enquirySuccess');
            });
		};

		$scope.getVehicleDetails = function(vin){
            SocketService.emit('vehicle:enquire', vin);
            SocketService.on('vehicle:enquirySuccess', function(data){
                console.log('loading complete ' + data);
                $scope.controllerData.vehicleDetails = angular.fromJson(data);
                SocketService.removeListener('vehicle:enquirySuccess');
            });
		};

        function nfcHandler(nfcEvent){

            var tag = nfcEvent.tag;
            var ndefMessage = tag.ndefMessage;
            var payload = nfc.bytesToString(ndefMessage[0].payload);

            json = angular.fromJson(payload.slice(3));
            console.log(payload.slice(3));

;            nfc.removeNdefListener(
                nfcHandler, // this must be the same as the function above
                function () {
                    console.log("Success, the listener has been removed.");
                },
                function (error) {
                    alert("Removing the listener failed");
                }
            );

            if(json.type == 'veh'){
                $scope.vehicleScanPopup.close();
            	$scope.openVIN(json.id);
			}
			if(json.type == 'part'){
            	$scope.partScanPopup.close();
            	//This needs to remove it from inventory after checking if its the part we expect
				$scope.openPart(json.id);
			}

            //$scope.vehicleScanPopup.close();
            //$scope.openVin(vin);
        };

		
	}
	
})();