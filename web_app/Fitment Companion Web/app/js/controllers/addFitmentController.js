/**
 * Module for the add fitments screen of the application
 * (Not fully implemented)
 */
angular.module('myApp.addFitment', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/fitments/add', {
            templateUrl: 'templates/addFitments.html',
            controller: 'AddFitmentsController' //Links controller to template
        });
    }])
    .controller('AddFitmentsController', function($location, $window, $rootScope, $scope, SocketService) {
        //Remove all listeners to avoid duplicated from other pages.
        SocketService.removeAllListeners();

        //Current signed in user.
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data
        $scope.controllerData = {
            parts:[],
            vehicles:[],

            fitmentGroup:{
                vin:"",
                desc:"",
                timestamp:null
            },
            fitmentOp:[], //Partid, Name + OperationDesc

            error:false,
            currentError:""

        };

        /*Controller Functions*/

        /**
         * Function to load vehicles and parts not currently assigned to groups.
         */
        $scope.loadResources = function(){
            //Server Request
            SocketService.emit('fitmentResources:load');
            SocketService.on('fitmentResources:loadSuccess', function(data){//Success
                console.log(data);
                data = angular.fromJson(data);

                $scope.controllerData.parts = data.parts;
                $scope.controllerData.vehicles = data.vehicles;
                SocketService.removeAllListeners();
            });
            SocketService.on('fitmentResources:loadFail', function(data){//Fail
                console.log(data);
                data = angular.fromJson(data);
                $scope.controllerData.error = true;
                $scope.controllerData.error = "There was a problem loading the vehicle and part data";
            });
        };


        /**
         * Function to run loadResources when the page loads.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadResources();
        });

        /*Navbar Functions*/
        $scope.logout = function(){
            var data = {//Payload
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            SocketService.emit('user:logout', angular.toJson(data));
        };

        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};
            $window.sessionStorage.user_name = {};
            $location.path('/login');//Navigates to the login screen
        });

        /**
         * The following functions navigates to other pages in the application
         * Called from the Nav Bar.
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