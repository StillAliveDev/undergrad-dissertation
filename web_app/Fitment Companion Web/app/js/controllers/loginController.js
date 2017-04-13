'use strict';
angular.module('myApp.login', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/login', {
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        });
    }])


    .controller('LoginController', function($window,$rootScope,$scope, SocketService, $location){
        SocketService.removeAllListeners();
        $scope.loginData = {
            username:"",
            pass:""
        };

        $scope.loginFailed = false;

        $scope.doLogin = function(){
            var loginData= {
                username: $scope.loginData.username,
                pass: $scope.loginData.pass
            };

            SocketService.emit('user:login', loginData);
        };

        SocketService.on('login:success', function(data){
            var json = angular.fromJson(data);

            $rootScope.user_id = json[0].user_id;
            $rootScope.user_name = json[0].user_name;

            $window.sessionStorage.user_id = json[0].user_id;
            $window.sessionStorage.user_name = json[0].user_name;

            $scope.loginFailed = false;

            $location.path('/home');
        });

        SocketService.on('login:fail', function(){
            $scope.loginData = {};
            $scope.loginFailed = true;
        })

    });