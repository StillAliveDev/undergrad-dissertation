/**
 * Created by Luke on 06/04/2017.
 */
'use strict';
angular.module('myApp.fitments', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/fitments', {
            templateUrl: 'templates/fitments.html',
            controller: 'FitmentsController'
        });
    }])

    .controller('FitmentsController', function($location, $window, $rootScope, $scope, SocketService){
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };
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

        $scope.loadAllFitments = function(){
            SocketService.emit('groups:loadFull');
            SocketService.on('groups:loadFullSuccess', function(data){
                var res = angular.fromJson(data);
                $scope.controllerData = {
                    fitments: res.fitments,
                    totalGroups: res.totalGroups,
                    totalAssigned: res.totalAssigned,
                    totalCompleted: res.totalCompleted,
                    pending: res.pending,
                    error : false,
                    currentError:""

                };
                SocketService.removeListener('groups:loadFullSuccess');
            });
            SocketService.on('groups:loadFullFail', function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.error = "Error loading groups";
                SocketService.removeListener('groups:loadFullFail');
            })
        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllFitments();
        });

        SocketService.on('group:notif', function(data){
            $scope.loadAllFitments();
        });


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