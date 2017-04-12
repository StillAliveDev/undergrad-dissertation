angular.module('myApp.addVehicle', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/vehicles/add', {
            templateUrl: 'templates/addVehicles.html',
            controller: 'AddVehiclesController'
        });
    }])
    .controller('AddVehiclesController', function($location, $window, $rootScope, $scope, SocketService) {
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData = {
            vehicle:{
                vin:"",
                make:"",
                model:"",
                colour:""
            },
            error: false,
            currentError:""
        };

        /*controller Functions*/
        $scope.cancel = function(){
            $scope.navVehicles();
        };

        $scope.addVehicle = function(){
            var data = {
                vehicle: $scope.controllerData.vehicle,
                username: $scope.currentUser.user_name
            };

            SocketService.emit('vehicle:add',data);
            SocketService.on('vehicle:addSuccess',function(data){
                $scope.controllerData.error = false;
                SocketService.removeListener('vehicle:addSuccess');
                $scope.navVehicles();
            });
            SocketService.on('vehicle:addFail', function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding vehicle: Check input fields, This vehicle may already exist";
            })
        }

        /*Navbar Functions*/
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        }

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
