/**
 * Module for the main vehicles page.
 */

'use strict';
angular.module('myApp.vehicles', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Route setup
        $routeProvider.when('/vehicles', {
            templateUrl: 'templates/vehicles.html',
            controller: 'VehiclesController'//Link controller to template.
        });
    }])

    .controller('VehiclesController', function($location, $window, $rootScope, $scope, SocketService){
        //Remove all active socket listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();

        //Current User.
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data.
        $scope.controllerData = {
            vehicles: [],
            total:0,
            totalAssigned: 0,
            error:false,
            currentError:"",
            addedSuccess:false
        };

        /*Page Functions*/

        /**
         * Function to refresh the vehicle statistics and listings.
         */
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

        /**
         * Function to delete a selected vehicle
         * @param vin: The vehicle to delete.
         */
        $scope.deleteVehicle = function(vin){
            var data = {//Payload
                username: $scope.currentUser.user_name, //Calling client.
                vin: vin //Vehicle to delete.
            };
            //Confirm
            if(window.confirm("Delete Vehicle: " + vin + "?")){
                SocketService.emit('vehicle:delete', data);
            }
            SocketService.on('vehicle:deleteSuccess', function(data){
                $scope.controllerData.error = false;
                console.log(data);
                SocketService.removeListener('vehicle:deleteSuccess');
            });
            SocketService.on('vehicle:deleteFail', function(data){
                console.log(data);
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Failed to delete Vehicle: Check it has no assigned groups";
            })
        };

        /**
         * Function to generate a download file containing vehicle tag information.
         * @param vin:: The vin to download
         * @param i: the index of the vehicle in the list
         */
        $scope.generateTagFile = function(vin,i){
            var data = { //Tag Payload.
                type:"veh",
                id:vin
            };
            //New Binary Large Object.
            var blob = new Blob([angular.toJson(data)], {type: 'text/plain'});
            //Gets the selected vehicle from the index supplied.
            var link = document.getElementById('downloadTag'+i);
            //Clears any URL already made.
            if($scope.controllerData.textFile!==null){
                $window.URL.revokeObjectURL($scope.controllerData.textFile);
            }

            //Creates a url for the tag data.
            $scope.controllerData.textFile = $window.URL.createObjectURL(blob);
            console.log($scope.controllerData.textFile);

            //Set the link href to the one created.
            link.href = $scope.controllerData.textFile;
        };

        /**
         * Function to navigate the user to the add vehicles page.
         */
        $scope.navAddVehicle = function(){
            $location.path('/vehicles/add');
        };

        /**
         * Function to refresh the page data when the page first loads.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllVehicles();
        });

        //Realtim Notification, refresh screen
        SocketService.on('vehicles:notif', function(data){
            $scope.loadAllVehicles();
        });

        /*Navbar Functions*/
        /**
         * Function to log the user out.
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        };

        //When logout success.
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');
        });

        /**
         * The following functions navigate to other pages in the application,
         * when a link in the nav bar is selected.
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