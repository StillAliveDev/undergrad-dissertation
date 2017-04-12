angular.module('myApp.addUser', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/users/add', {
            templateUrl: 'templates/addUsers.html',
            controller: 'AddUsersController'
        });
    }])
    .controller('AddUsersController', function($location, $window, $rootScope, $scope, SocketService) {
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        $scope.controllerData = {
            user: {
                user_name: "",
                password: "",
                user_first_name: "",
                user_last_name: ""
            },
            error: false,
            currentError: ""
        };

        /*controller Functions*/
        $scope.cancel = function(){
            $scope.navUsers();
        };

        $scope.addUser = function(){
            var data = {
                username : $scope.currentUser.user_name,
                user : $scope.controllerData.user
            };

            SocketService.emit('user:add', data);
            SocketService.on('user:addSuccess', function(data){
                $scope.controllerData.error = false;
                SocketService.removeListener('user:addSuccess');
                $scope.navUsers();
            });
            SocketService.on('user:addFail',function(data){
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding user: Check input fields, This user-name may already exist";
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