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

        $scope.proccessNotif = function(eventType, event, eventUser){
            var eventData = {
                type:eventType,
                user:eventUser,
                text:""
            };

            switch(eventType){
                case 'P':
                    switch(event){
                        case 'A':
                            eventData.text = "added a new Part";
                            break;
                        case 'D':
                            eventData.text = "deleted a Part";
                            break;
                        case 'Ret':
                            eventData.text = "returned a Part to inventory";
                            break;
                        case 'R': eventData.text = "removed a Part from inventory";
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'V':
                    switch(event){
                        case 'A':
                            eventData.text = "added a new Vehicle";
                            break;
                        case 'D':
                            eventData.text = "deleted a Vehicle";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'G':
                    switch(event){
                        case 'A':
                            eventData.text = "created a new Group";
                            break;
                        case 'D':
                            eventData.text = "deleted a Fitment Group";
                            break;
                        case 'F':
                            eventData.text = "finished a Fitment Group";
                            break;
                        case 'S':
                            eventData.text = "started a Fitment Group";
                            break
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'L':
                    switch(event){
                        case 'I':
                            eventData.text = "logged in";
                            break;
                        case 'O':
                            eventData.text = "logged out";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'U':
                    switch(event){
                        case 'A':
                            eventData.text = "created a new User";
                            break;
                        case 'D':
                            eventData.text = "deleted a User";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
            }
        };

        $scope.updateTicker = function(eventData){
            console.log("Updating Ticker " + eventData.user + " " + eventData.text + " " + eventData.type);

            //Put on top of the array -- shuffle down, only allow 10 elements

            $scope.controllerData.events.unshift({
                timestamp: new Date().getTime(),
                type: eventData.type,
                text: eventData.text,
                user: eventData.user
            });

        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllStats();
        });

        /*Realtime Notifications*/
        SocketService.on('part:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('P', data.notifType, data.eventUser);
        });
        SocketService.on('vehicles:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('V', data.notifType, data.eventUser);
        });
        SocketService.on('group:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('G', data.notifType, data.eventUser);
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
        SocketService.on('users:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('U',data.notifType, data.eventUser);
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