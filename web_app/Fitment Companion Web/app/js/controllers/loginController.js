'use strict';
angular.module('myApp.login', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/login', {
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        });
    }])

    .controller('LoginController', function($scope, SocketService){
        SocketService.on('test:emit', function(){
            console.log('hello from server');
        })

    });