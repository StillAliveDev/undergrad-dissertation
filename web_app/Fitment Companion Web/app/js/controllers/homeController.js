'use strict';
angular.module('myApp.home', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        $routeProvider.when('/home', {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        });
    }])

    .controller('HomeController', function($scope, SocketService){


    });