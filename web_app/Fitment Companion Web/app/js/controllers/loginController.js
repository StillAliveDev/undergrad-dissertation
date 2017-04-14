/**
 * Module for the login screen.
 */
'use strict';
angular.module('myApp.login', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Set up page route
        $routeProvider.when('/login', {
            templateUrl: 'templates/login.html',
            controller: 'LoginController'//Links controller to template.
        });
    }])


    .controller('LoginController', function($window,$rootScope,$scope, SocketService, $location){
        //Remove all socket listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();

        $scope.loginData = {
            username:"",
            pass:""
        };

        $scope.loginFailed = false; //Error UI element show/hide.

        /**
         * Function to log the user into the application.
         */
        $scope.doLogin = function(){
            var loginData= {
                username: $scope.loginData.username,
                pass: $scope.loginData.pass
            };

            //Server request
            SocketService.emit('user:login', loginData);
        };

        //When login success.
        SocketService.on('login:success', function(data){
            var json = angular.fromJson(data);

            //Loads user data into $rootScope - to be shared by all controllers.
            $rootScope.user_id = json[0].user_id;
            $rootScope.user_name = json[0].user_name;

            //Loads the user data into the current session storage ... seems to work better than rootScope.
            $window.sessionStorage.user_id = json[0].user_id;
            $window.sessionStorage.user_name = json[0].user_name;

            $scope.loginFailed = false;

            $location.path('/home');//Nav to home screen
        });

        //When login fails.
        SocketService.on('login:fail', function(){
            $scope.loginData = {};
            $scope.loginFailed = true;
        })

    });