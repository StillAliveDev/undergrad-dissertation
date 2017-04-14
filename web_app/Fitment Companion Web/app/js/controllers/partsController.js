/**
 * Module for the main parts screen
 */
'use strict';
angular.module('myApp.parts', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Set up route
        $routeProvider.when('/parts', {
            templateUrl: 'templates/parts.html',
            controller: 'PartsController'//Links controller to template.
        });
    }])

    .controller('PartsController', function($location, $window, $rootScope, $scope, SocketService){
        //Remove all active socket listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();
        //The current user.
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data.
        $scope.controllerData = {
            parts: [],
            total:0,
            totalAssigned: 0,
            totalInInventory:0,
            textFile:null,
            error:false,
            currentError:""
        };
        /*Page Functions*/

        /**
         * Function to refresh all fitment statistics and lists.
         */
        $scope.loadAllParts = function(){
            //Server request
            SocketService.emit('parts:loadFull');
            SocketService.on('parts:loadFullSuccess', function(data){//Success
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                var res = angular.fromJson(data);
                //Assemble Data.
                $scope.controllerData.parts = res.parts;
                $scope.controllerData.total = res.total;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalInInventory = res.totalInInventory;
                console.log(data);
                //Remove Listener
                SocketService.removeListener('parts:loadFullSuccess');
            });
        };

        /**
         * Function to delete a part from the database.
         * @param id: the part to delete.
         */
        $scope.deletePart = function(id){
            var data = { //Payload
                part_id : id,
                username: $window.sessionStorage.user_name //Calling client username
            };

            //Provides confirm box
            if(window.confirm("Delete Part: " + id + "?")){
                //Server request
                SocketService.emit('part:delete', data);
            }
            SocketService.on('part:deleteSuccess', function(data){//Success
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                console.log(data);
                SocketService.removeListener('part:deleteSuccess');

            });
            SocketService.on('part:deleteFail', function(data){//Fail
                console.log(data);
                $scope.controllerData.error=true;
                $scope.controllerData.currentError = "Could not delete part: Check it has no assigned groups";
            })


        };

        /**
         * Function to navigate to the add user page.
         */
        $scope.navAddPart = function(){
            $location.path('/parts/add');
        };

        /**
         * Function to generate a tag file for download
         * @param partId: The part to download
         * @param i: the index of the part in the current list.
         */
        $scope.generateTagFile = function(partId,i){
            var data = { //Tag payload
                type:"part",
                id:partId
            };
            // New Binary Large Object of type text/plain
            var blob = new Blob([angular.toJson(data)], {type: 'text/plain'});
            //Gets the link selected
            var link = document.getElementById('downloadTag'+i);

            if($scope.controllerData.textFile!==null){
                //Ensures the right URL is being made, deletes any leftover links from last time.
                $window.URL.revokeObjectURL($scope.controllerData.textFile);
            }

            //Creates a new URL for the tag data.
            $scope.controllerData.textFile = $window.URL.createObjectURL(blob);
            //Sets the link Href property.
            link.href = $scope.controllerData.textFile;
        };


        /**
         * Function to load all statistics and data when the page loads.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllParts();
        });

        //Realtime notifications -- Reload statictics.
        SocketService.on('group:notif', function(data){
            $scope.loadAllParts();
        });
        SocketService.on('part:notif', function(data){
            $scope.loadAllParts();
        });


        /*Navbar Functions*/
        /**
         * Function to lod the user out.
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        };

        //When lopgout success.
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Nav to login page.
        });

        /**
         * The following functions navigate to other pages in the applcation when a
         * link is selected from the nav bar.
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