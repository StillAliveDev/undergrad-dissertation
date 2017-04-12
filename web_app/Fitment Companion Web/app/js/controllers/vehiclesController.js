'use strict';
angular.module('myApp.vehicles', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/vehicles', {
            templateUrl: 'templates/vehicles.html',
            controller: 'VehiclesController'
        });
    }])

    .controller('VehiclesController', function($location, $window, $rootScope, $scope, SocketService){
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData = {
            vehicles: [],
            total:0,
            totalAssigned: 0,
            error:false,
            currentError:"",
            addedSuccess:false
        };

        /*Page Functions*/

        $scope.loadAllVehicles = function(){
            SocketService.emit('vehicles:loadFull');
            SocketService.on('vehicles:loadFullSuccess', function(data){
                $scope.controllerData.error = false;
                console.log(data);
                var res = angular.fromJson(data);
                $scope.controllerData.vehicles = res.vehicles;
                $scope.controllerData.total = res.total;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                SocketService.removeListener('vehicles:loadFullSuccess');
            })
        };

        $scope.deleteVehicle = function(vin){
            var data = {
                username: $scope.currentUser.user_name,
                vin: vin
            };
            if(window.confirm("Delete Vehicle: " + vin + "?")){
                SocketService.emit('vehicle:delete', data);
            }
            SocketService.on('vehicle:deleteSuccess', function(data){
                $scope.controllerData.error = false;
                console.log(data);
                $scope.loadAllVehicles();
                SocketService.removeListener('vehicle:deleteSuccess');
            });
            SocketService.on('vehicle:deleteFail', function(data){
                console.log(data);
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Failed to delete Vehicle: Check it has no assigned groups";
            })
        };

        $scope.generateTagFile = function(vin,i){
            var data = {
                type:"veh",
                id:vin
            };
            var blob = new Blob([angular.toJson(data)], {type: 'text/plain'});
            var link = document.getElementById('downloadTag'+i);
            if($scope.controllerData.textFile!==null){
                $window.URL.revokeObjectURL($scope.controllerData.textFile);
            }

            $scope.controllerData.textFile = $window.URL.createObjectURL(blob);
            console.log($scope.controllerData.textFile);

            link.href = $scope.controllerData.textFile;
        };

        $scope.navAddVehicle = function(){
            $location.path('/vehicles/add');
        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllVehicles();
        });

        SocketService.on('vehicles:notif', function(data){
            $scope.loadAllVehicles();
        });

        /*Navbar Functions*/
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        };

        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');
        });

        $scope.navVehicles = function(){
            $location.path('/vehicles');
        };

        $scope.navUsers = function(){
            $location.path('/users');
        };

        $scope.navParts = function(){
            $location.path('/parts');
        };

        $scope.navFitments = function(){
            $location.path('/fitments');
        };

        $scope.navHome = function() {
            $location.path('/home');
        };
    });