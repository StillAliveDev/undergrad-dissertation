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
                SocketService.on('vehicles:notif', function(){
                    SocketService.emit('home:load');
                });
                SocketService.on('part:notif', function(data){
                    SocketService.emit('home:load');
                });
                SocketService.on('group:notif', function(data){
            SocketService.emit('home:load');
        });
	}


})();