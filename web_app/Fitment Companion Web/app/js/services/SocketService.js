/**
 * SocketService, makes all socket functions available to modules that have it as a dependency
 */
'use strict';
(function(){
    angular.module('myApp.socket',[])
        .service('SocketService',['socketFactory', SocketService]);

    function SocketService(socketFactory){
        return socketFactory({
            ioSocket: io.connect('http://localhost:6100')//Ip Address for the servseride.
        });
    }
})();