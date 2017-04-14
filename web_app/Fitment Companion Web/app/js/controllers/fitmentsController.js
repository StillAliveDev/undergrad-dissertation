/**
 * Module for the fitments list page
 */
'use strict';
angular.module('myApp.fitments', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Set up the route
        $routeProvider.when('/fitments', {
            templateUrl: 'templates/fitments.html',
            controller: 'FitmentsController' //Links the controller to the Template
        });
    }])

    .controller('FitmentsController', function($location, $window, $rootScope, $scope, SocketService){
        //Removes all socket listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();
        //Current user
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };
        //Controller Data
        $scope.controllerData = {
            fitments:[],
            totalGroups:0,
            totalAssigned:0,
            totalCompleted:0,
            pending:0,
            error:false,
            currentError:""
        };
        /*Page Functions*/

        /**
         * Function to load all fitments in the database and fitment statistics
         */
        $scope.loadAllFitments = function(){
            //Server Request
            SocketService.emit('groups:loadFull');
            SocketService.on('groups:loadFullSuccess', function(data){//Success
                var res = angular.fromJson(data);

                $scope.controllerData.fitments = res.fitments;
                $scope.controllerData.totalGroups = res.totalGroups;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalCompleted = res.totalCompleted;
                $scope.controllerData.pending = res.pending;
                SocketService.removeListener('groups:loadFullSuccess');
            });
            SocketService.on('groups:loadFullFail', function(data){//Fail
                $scope.controllerData.error = true;
                $scope.controllerData.error = "Error loading groups";
                SocketService.removeListener('groups:loadFullFail');
            })
        };

        /**
         * Function to delete a given group
         * @param groupid: the group id of the group to delete
         */
        $scope.deleteGroup = function(groupid){
            var data = {//Payload
                username: $scope.currentUser.user_name,//Calling client
                fitment: groupid //Group to delete
            };

            //Provide confirmation popup
            if(window.confirm("Delete Group: " + groupid + "?")){
                //Server request to delete group
                SocketService.emit('group:delete', data);
            }
            SocketService.on('group:deleteSuccess', function(data){//Success
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                SocketService.removeListener('group:deleteSuccess');
            });
            SocketService.on('group.deleteFail', function(data){//Fail
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error Deleting Group";
                SocketService.removeListener('group:deleteFail');
            })

        };

        /**
         * Function to load all fitments when the page is opened, so no
         * need to refresh in the first instance.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllFitments();
        });

        /**
         * Function Part of the realtime notification system, when a change has been made to the groups,
         * he page will refresh for this and all other clients. Reflecting the change immediately.
         */
        SocketService.on('group:notif', function(data){
            $scope.loadAllFitments();
        });

        /**
         * Navigates to the add fitment page
         */
        $scope.navAddFitment = function(){
            $location.path('/fitments/add');
        };


        /*Navbar Functions*/
        /**
         * Function to log the user out when the lougout button is pressed in the nav bar.
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            //Logout
            SocketService.emit('user:logout', angular.toJson(data));
        };

        //When logout success
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};//Clear data.
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Navigate to the login page
        });

        /**
         * The following functions navigate the user to different pages in the appliction,
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