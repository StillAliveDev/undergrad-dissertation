(function(){
	angular.module('starter')
	.controller('HomeController',['$scope','$state','localStorageService','SocketService', HomeController]);

	function HomeController($scope,$state,localStorageService,SocketService){
		$scope.controllerData = {
			stats: {}
		};

		SocketService.on('home:loadSuccess', function(data){
			console.log(data);
			$scope.controllerData.stats = angular.fromJson(data);
		});

		//Updates numbers when ew items are added (Realtime Functionality)
		SocketService.on('vehicle:addSuccess', function(){
			SocketService.emit('home:load');
			$scope.$apply();
		});
		SocketService.on('part:addSuccess', function(){
			SocketService.emit('home:load');
			$scope.$apply();
		})
		SocketService.on('vehicle:assignSuccess', function(){
			SocketService.emit('home:load');
			$scope.$apply();
		});
		SocketService.on('part:assignSuccess', function(){
            SocketService.emit('home:load');
            $scope.$apply();
        })
        SocketService.on('part:invNotif', function(data){
            SocketService.emit('home:load');
            $scope.$apply();
        })
	}


})();