(function(){
	angular.module('starter')
	.service('SocketService',['socketFactory', SocketService]);

    /**
	 * Service to define the IP address of the serverside 'Fitment Companion Serverside',
	 * and make the 'SocketService' available to all other modules.
     * @param socketFactory
     * @returns {*}: the Socket
     * @constructor
     */
	function SocketService(socketFactory){
		return socketFactory({
			ioSocket: io.connect('http://192.168.1.5:6100') //IP Address.
			//Port 6100 is arbitrary, but must be the same on the serverside.
			//This IP Address will change depening on the IP address of the serverside... Check before deployment
			//Reflect this IP in index too.
		});
	}
})();