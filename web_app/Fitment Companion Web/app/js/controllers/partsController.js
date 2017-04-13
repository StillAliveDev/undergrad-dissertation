'use strict';
angular.module('myApp.parts', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/parts', {
            templateUrl: 'templates/parts.html',
            controller: 'PartsController'
        });
    }])

    .controller('PartsController', function($location, $window, $rootScope, $scope, SocketService){
        SocketService.removeAllListeners();
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };
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

        $scope.loadAllParts = function(){
            SocketService.emit('parts:loadFull');
            SocketService.on('parts:loadFullSuccess', function(data){
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                var res = angular.fromJson(data);
                $scope.controllerData.parts = res.parts;
                $scope.controllerData.total = res.total;
                $scope.controllerData.totalAssigned = res.totalAssigned;
                $scope.controllerData.totalInInventory = res.totalInInventory;
                console.log(data);
                SocketService.removeListener('parts:loadFullSuccess');
            });
        };

        $scope.deletePart = function(id){
            var data = {
                part_id : id,
                username: $window.sessionStorage.user_name
            };

            if(window.confirm("Delete Part: " + id + "?")){
                SocketService.emit('part:delete', data);
            }
            SocketService.on('part:deleteSuccess', function(data){
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";
                console.log(data);
                SocketService.removeListener('part:deleteSuccess');

            });
            SocketService.on('part:deleteFail', function(data){
                console.log(data);
                $scope.controllerData.error=true;
                $scope.controllerData.currentError = "Could not delete part: Check it has no assigned groups";
            })


        };

        $scope.navAddPart = function(){
            $location.path('/parts/add');
        };

        $scope.generateTagFile = function(partId,i){
            var data = {
                type:"part",
                id:partId
            };
            var blob = new Blob([angular.toJson(data)], {type: 'text/plain'});
            var link = document.getElementById('downloadTag'+i);
            if($scope.controllerData.textFile!==null){
                $window.URL.revokeObjectURL($scope.controllerData.textFile);
            }

            $scope.controllerData.textFile = $window.URL.createObjectURL(blob);
            console.log($scope.controllerData.textFile);

            link.href = $scope.controllerData.textFile;
        };


        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllParts();
        });

        SocketService.on('group:notif', function(data){
            $scope.loadAllParts();
        });
        SocketService.on('part:notif', function(data){
            $scope.loadAllParts();
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