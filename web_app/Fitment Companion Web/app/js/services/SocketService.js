'use strict';
(function(){
    angular.module('myApp.socket',[])
        .service('SocketService',['socketFactory', SocketService]);

    function SocketService(socketFactory){
        return socketFactory({
            ioSocket: io.connect('http://localhost:6100')
        });
    }
})();