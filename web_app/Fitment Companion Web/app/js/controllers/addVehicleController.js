/**
 * Module for the add vehicles screen
 */
angular.module('myApp.addVehicle', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Set up the route data
        $routeProvider.when('/vehicles/add', {
            templateUrl: 'templates/addVehicles.html',
            controller: 'AddVehiclesController' //Links controller to template
        });
    }])
    .controller('AddVehiclesController', function($location, $window, $rootScope, $scope, SocketService) {
        //Removes all active socket listeners to avoid duplicates from other pages,
        SocketService.removeAllListeners();
        //The current User
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //ControllerData
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
        /**
         * Function to navigate back to the vehicles list if the user cancels the operation
         */
        $scope.cancel = function(){
            $scope.navVehicles();
        };

        /**
         * Function to add the vehicle to the database
         */
        $scope.addVehicle = function(){
            var data = {//Payload
                vehicle: $scope.controllerData.vehicle,//Vehicle
                username: $scope.currentUser.user_name//Calling client username
            };

            //Make request to server
            SocketService.emit('vehicle:add',data);
            SocketService.on('vehicle:addSuccess',function(data){//Success
                $scope.controllerData.error = false;
                SocketService.removeListener('vehicle:addSuccess');
                $scope.navVehicles();
            });
            SocketService.on('vehicle:addFail', function(data){//Fail
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding vehicle: Check input fields, This vehicle may already exist";
            })
        };

        /*Navbar Functions*/
        /**
         * Function to log the user out when the logout button is pressed
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            //Logout
            SocketService.emit('user:logout', angular.toJson(data));
        };

        //Logout Success
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Navigate to the login page
        });

        /**
         * The following functions navigate to different ages in the application
         * when a link in the navbar is selected
         */
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
