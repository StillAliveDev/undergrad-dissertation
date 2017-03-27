(function(){
	angular.module('starter')
	.controller('PartsController',['$scope','$rootScope','$state','$ionicPopup','localStorageService','SocketService', PartsController]);
	
	function PartsController($scope,$rootScope,$state,$ionicPopup,localStorageService,SocketService){
		$scope.partsList =[];

		$scope.loadList = function(){
		    SocketService.emit('parts:loadList');
		    SocketService.on('parts:loadComplete', function(data){
		       console.log('loading complete ' + data);

		       $scope.partsList = angular.fromJson(data);
		       $rootScope.$broadcast('scroll.refreshComplete');
		       SocketService.removeListener('parts:loadComplete');
            });
		    SocketService.on('parts:loadError',function(data){
		        console.log(data);
            });

        };

		$scope.openPart = function(part_id){
			console.log('Opening Part Popup');
			$scope.partData = [{
			    'part_id': part_id
            }];
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
			console.log(payload);
		};
	}
	
})();