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
				toRemove:true,
				correctPart:true
			},
			expectedTag:""
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
            $scope.controllerData.partsScan.correctPart = true;
			$scope.partScanPopup = $ionicPopup.confirm({
				title: "Remove/Replace Part",
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});
			$scope.controllerData.expectedTag = "part";
            $scope.listenForNFC();
		};		
		
		$scope.openVehicleScan = function(){
			console.log('Opening Vehicle Scan Popup');
			$scope.vehicleScanPopup = $ionicPopup.confirm({
				title: 'Vehicle Enquire',
				templateUrl: 'templates/vehicleScanModal.html',
				scope: $scope
			});
			$scope.controllerData.expectedTag = "veh";
            $scope.listenForNFC();
		};

		$scope.processPart = function(id){
			if(id == $scope.controllerData.partDetails.part.PART_ID){
				$scope.partScanPopup.close();
				$scope.returnRemovePart(id);
			}
			else{
				$scope.controllerData.partsScan.correctPart = false;
				$scope.$apply(); // Refreshes the View
			}
		}


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

		$scope.returnRemovePart = function(id){
            var data = {
                username: $rootScope.user_name,
                part_id : id
            };
			if($scope.controllerData.partDetails.part.IN_INVENTORY == "FALSE"){
                console.log('Returning Part' + id);
                SocketService.emit('part:return',data);
                SocketService.on('part:returnSuccess',function(data){
                	console.log('part returned : ' + data);
				});
			}
			else{
				console.log('Removing Part' + id);
				SocketService.emit('part:remove', data);
				SocketService.on('part:removeSuccess', function(data){
					console.log('part removed : ' + data);
				});
			}
            $scope.partEnquiry(id);
			$scope.getVehicleDetails($scope.controllerData.vehicleDetails.vehicle.VIN);

		};

		$scope.stopListeningForNFC = function(){
            nfc.removeNdefListener(
                nfcHandler, // this must be the same as the function above
                function () {
                    console.log('NFC Listener Removed');
                },
                function (error) {
                    alert('Removing the listener failed: ' + error);
                }
            );
		};

		$scope.listenForNFC = function() {
            nfc.addNdefListener(
                nfcHandler,
                function(){
                    console.log('Listening for a tag');
                },
                function(error){
                    console.log('Error adding listener: ' + error);
                }
            );
		};

        function nfcHandler(nfcEvent){

            var tag = nfcEvent.tag;
            var ndefMessage = tag.ndefMessage;
            var payload = nfc.bytesToString(ndefMessage[0].payload);

            json = angular.fromJson(payload.slice(3));
            console.log(payload.slice(3));

            $scope.stopListeningForNFC();
            console.log('Listener should have been removed here');

            if((json.type == 'veh') && ($scope.controllerData.expectedTag == 'veh')){
                $scope.vehicleScanPopup.close();
                $scope.openVIN(json.id);
            }
            if((json.type == 'part') && ($scope.controllerData.expectedTag == 'part')){
                //This needs to remove it from inventory after checking if its the part we expect
                $scope.processPart(json.id);
            }
        };

		
	}
	
})();