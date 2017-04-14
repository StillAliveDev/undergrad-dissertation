/**
 * Module for the Add Users screen
 */
angular.module('myApp.addUser', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Sets up route to page
        $routeProvider.when('/users/add', {
            templateUrl: 'templates/addUsers.html',
            controller: 'AddUsersController'//Links controller to template
        });
    }])
    .controller('AddUsersController', function($location, $window, $rootScope, $scope, SocketService) {
        //Removes realtime listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data.
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
        /**
         * Navigates the user away from the page if they wish to cancel the operation.
         */
        $scope.cancel = function(){
            $scope.navUsers();
        };

        /**
         * Function to add a user to the database.
         */
        $scope.addUser = function(){
            var data = {//Payload
                username : $scope.currentUser.user_name, //Calling client
                user : $scope.controllerData.user//The user to add
            };

            //Realtime server request
            SocketService.emit('user:add', data);
            SocketService.on('user:addSuccess', function(data){//Success
                $scope.controllerData.error = false;
                SocketService.removeListener('user:addSuccess');
                $scope.navUsers();
            });
            SocketService.on('user:addFail',function(data){//Fail
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding user: Check input fields, This user-name may already exist";
            });
        };

        /*Navbar Functions*/
        /**
         * Function to log the user out
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        };

        //Logout success
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Navigate to login page
        });

        /**
         * THe following functions navigate to other pages in the application
         * when links on the navbar are clicked
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