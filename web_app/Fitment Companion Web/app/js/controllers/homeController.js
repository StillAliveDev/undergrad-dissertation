'use strict';
angular.module('myApp.home', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/home', {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        });
    }])

    .controller('HomeController', function($location, $window, $rootScope, $scope, SocketService){
        SocketService.removeAllListeners();
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData = {
            users:{},
            parts:{},
            vehicles:{},
            fitments:{},
            error:false,
            events:[],
            currentError:""

        };

        /*Page Functions*/

        $scope.loadAllStats = function(){
            SocketService.emit('home:loadFull');
            SocketService.on('home:loadFullSuccess', function(data){
                console.log(data);
                var res = angular.fromJson(data);
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";

                $scope.controllerData.users = res.users;
                $scope.controllerData.parts = res.parts;
                $scope.controllerData.vehicles = res.vehicles;
                $scope.controllerData.fitments = res.fitments;

                SocketService.removeListener('home:loadFullSuccess');
            });
            SocketService.on('home:loadFullFail', function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error retrieving statistics";
            });
        };

        $scope.proccessNotif = function(event, eventType, eventUser){

        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllStats();
        });

        /*Realtime Notifications*/
        SocketService.on('part:notif', function(data){
            var eventData = {
                notifType: data.notifType,
                eventUser: data.user
            };

            $scope.loadAllStats();
        });
        SocketService.on('vehicle:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('V', data.notifType, data.user);
        });
        SocketService.on('group:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('G', data.notifType, data.user);
        });
        SocketService.on('login:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('L','I', data[0].user_name);
        });
        SocketService.on('logout:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('L','O', data[0].user);
        });
        SocketService.on('U','users:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif(data.notifType, data.user);
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

        $scope.navHome = function(){
            $location.path('/home');
        };

    });