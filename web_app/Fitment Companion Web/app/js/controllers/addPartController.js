angular.module('myApp.addPart', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/parts/add', {
            templateUrl: 'templates/addParts.html',
            controller: 'AddPartsController'
        });
    }])
    .controller('AddPartsController', function($location, $window, $rootScope, $scope, SocketService) {
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData = {
            part:{
                name:"",
                manufacturer:"",
                width:null,
                length:null,
                weight:null
            },
            error: false,
            currentError: ""
        };

        /*controller Functions*/
        $scope.cancel = function(){
            $scope.navParts();
        };

        $scope.addPart = function(){
            var data = {
                username : $scope.currentUser.user_name,
                part : $scope.controllerData.part
            };

            SocketService.emit('part:add', data);
            SocketService.on('part:addSuccess', function(data){
                $scope.controllerData.error = false;
                SocketService.removeListener('part:addSuccess');
                $scope.navParts();
            });
            SocketService.on('part:addFail',function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding part: Check input fields";
            });
        };

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