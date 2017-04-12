/**
 * Created by Luke on 06/04/2017.
 */
'use strict';
angular.module('myApp.users', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/users', {
            templateUrl: 'templates/users.html',
            controller: 'UsersController'
        });
    }])

    .controller('UsersController', function($location, $window, $rootScope, $scope, SocketService){
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData ={
            users:[],
            total:0,
            totalAssigned:0,
            totalSignedIn:0,
            error:false,
            currentError:""
        };
        /*Page Functions*/

        $scope.loadAllUsers = function(){
            SocketService.emit('users:loadFull');
            SocketService.on('users:loadFullSuccess', function(data){
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                console.log(data);
                var res = angular.fromJson(data);
                $scope.controllerData.users = res.users;
                $scope.controllerData.total = res.total;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalSignedIn = res.totalSignedIn;

                SocketService.removeListener('users:loadFullSuccess');
            })
        };

        $scope.deleteUser = function(id){
            var data = {
                username : $window.sessionStorage.user_name,
                user_id : id
            };

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

        $scope.navAddUser = function(){
            $location.path('/users/add');
        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllUsers();
        });

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