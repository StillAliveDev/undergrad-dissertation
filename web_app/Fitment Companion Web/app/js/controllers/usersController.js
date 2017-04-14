/**
 * Module for the main users screen
 */
'use strict';
angular.module('myApp.users', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Setup route
        $routeProvider.when('/users', {
            templateUrl: 'templates/users.html',
            controller: 'UsersController'//Links controller to template
        });
    }])

    .controller('UsersController', function($location, $window, $rootScope, $scope, SocketService){
        //Removes all active socket listeners to avoid duplicates.
        SocketService.removeAllListeners();
        //Current User.
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data.
        $scope.controllerData ={
            users:[],
            total:0,
            totalAssigned:0,
            totalSignedIn:0,
            error:false,
            currentError:""
        };
        /*Page Functions*/

        /**
         * Function to refresh the users statistics and listings.
         */
        $scope.loadAllUsers = function(){
            //Server Request.
            SocketService.emit('users:loadFull');
            SocketService.on('users:loadFullSuccess', function(data){//When success.
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                console.log(data);
                var res = angular.fromJson(data);
                $scope.controllerData.users = res.users;//Assemble Data.
                $scope.controllerData.total = res.total;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalSignedIn = res.totalSignedIn;

                SocketService.removeListener('users:loadFullSuccess');
            })
        };

        /**
         * Function to delete a select user.
         * @param id: the user to delete.
         */
        $scope.deleteUser = function(id){
            var data = {//Payload
                username : $window.sessionStorage.user_name, //Calling client username.
                user_id : id //User to delete.
            };

            //Confirm box.
            if(window.confirm("Delete User: " + id + "?")){
                SocketService.emit('user:delete', data);
                SocketService.on('user:deleteSuccess', function(data){
                    $scope.controllerData.error = false;
                    console.log(angular.fromJson(data));
                    SocketService.removeListener('part:deleteSuccess');
                });
                SocketService.on('user:deleteFail', function(data){
                    console.log(angular.fromJson(data));
                    $scope.controllerData.error = true;
                    $scope.controllerData.currentError = "Failed to delete User: check it has no assigned groups";
                });
            }
        };

        /**
         * Navigates to the add user page.
         */
        $scope.navAddUser = function(){
            $location.path('/users/add');
        };

        /**
         * Refreshes statistics when the page loads.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllUsers();
        });

        //Realtime listeners.
        SocketService.on('users:notif', function(data){
            $scope.loadAllUsers();
        });
        SocketService.on('login:notif', function(data){
            $scope.loadAllUsers();
        });
        SocketService.on('logout:notif', function(data){
            $scope.loadAllUsers();
        });
        SocketService.on('group:notif', function(data){
            $scope.loadAllUsers();
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

        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');
        });

        /**
         * The following functions navigate to other pages in the application
         * when a link in the nav ber is pressed.
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