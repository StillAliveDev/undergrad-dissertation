(function(){
	angular.module('starter')
	.controller('PartsController',['$scope','$rootScope','$state','$ionicPopup','localStorageService','SocketService', PartsController]);
	
	function PartsController($scope,$rootScope,$state,$ionicPopup,localStorageService,SocketService){

		$scope.controllerData = {
			partsList : [],
			partDetails:{
				part:{}
			},
			partsScan:{
				toRemove: false,
				correctPart: true
			}
		};

		$scope.loadList = function(){
		    SocketService.emit('parts:loadList');
		    SocketService.on('parts:loadComplete', function(data){
		       console.log('loading complete ' + data);

		       $scope.controllerData.partsList = angular.fromJson(data);
		       $rootScope.$broadcast('scroll.refreshComplete');
		       SocketService.removeListener('parts:loadComplete');
            });
		    SocketService.on('parts:loadError',function(data){
		        console.log(data);
            });

        };

		$scope.openPart = function(part){
			console.log('Opening Part Popup');
            SocketService.emit('part:enquire',part);
            SocketService.on('part:enquirySuccess', function(data){
                console.log(data);
                $scope.controllerData.partDetails = angular.fromJson(data);
                SocketService.removeListener('part:enquirySuccess');
            });

			var partPopup = $ionicPopup.confirm({
				title: 'Part Detail',
				templateUrl: 'templates/partDetailModal.html',
				scope: $scope
			});
		};
		
		$scope.openPartScan = function(){
			console.log('Opening Part Scan Popup');
			var partScanPopup = $ionicPopup.confirm({
				title: 'Part Enquire',
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

        function nfcHandler(nfcEvent){

            var tag = nfcEvent.tag;
            var ndefMessage = tag.ndefMessage;
            var payload = nfc.bytesToString(ndefMessage[0].payload);

            json = angular.fromJson(payload.slice(3));
            console.log(payload.slice(3));

            nfc.removeNdefListener(
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