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

                $scope.controllerData.fitments = res.fitments;
                $scope.controllerData.totalGroups = res.totalGroups;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalCompleted = res.totalCompleted;
                $scope.controllerData.pending = res.pending;

                SocketService.removeListener('groups:loadFullSuccess');
            });
            SocketService.on('groups:loadFullFail', function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.error = "Error loading groups";
                SocketService.removeListener('groups:loadFullFail');
            })
        };

        $scope.deleteGroup = function(groupid){
            var data = {
                username: $scope.currentUser.user_name,
                fitment: groupid
            };

            if(window.confirm("Delete Group: " + groupid + "?")){
                SocketService.emit('group:delete', data);
            }
            SocketService.on('group:deleteSuccess', function(data){
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                SocketService.removeListener('group:deleteSuccess');
            });
            SocketService.on('group.deleteFail', function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error Deleting Group";
                SocketService.removeListener('group:deleteFail');
            })

        };

        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllFitments();
        });

        SocketService.on('group:notif', function(data){
            $scope.loadAllFitments();
        });
        $scope.navAddFitment = function(){
            $location.path('/fitments/add');
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