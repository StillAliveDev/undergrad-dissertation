/**
 * Module for the add parts screen of the application
 */
angular.module('myApp.addPart', ['ngRoute', 'ui.bootstrap'])

    //Route information
    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/parts/add', {
            templateUrl: 'templates/addParts.html',
            controller: 'AddPartsController' //Links controller to template
        });
    }])
    .controller('AddPartsController', function($location, $window, $rootScope, $scope, SocketService) {
        //Removes all liusteners to avoid duplicates from other pages.
        SocketService.removeAllListeners();
        //The current user
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data
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
        /**
         * Function to navigate back to the parts list, if the user wished to cancel
         */
        $scope.cancel = function(){
            $scope.navParts();
        };

        /**
         * Function to add a part
         */
        $scope.addPart = function(){
            var data = { //Payload
                username : $scope.currentUser.user_name,
                part : $scope.controllerData.part
            };

            //Request to the serverside
            SocketService.emit('part:add', data);
            SocketService.on('part:addSuccess', function(data){ //Success
                $scope.controllerData.error = false;
                SocketService.removeListener('part:addSuccess');
                $scope.navParts();
            });
            SocketService.on('part:addFail',function(data){ //Fail
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error adding part: Check input fields";
            });
        };

        /*Navbar Functions*/
        /**
         * Function to log the user out.
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));//Logs the user out
        };

        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Change to the login screen
        });

        /**
         * The following functions navigate to other pages in the application
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