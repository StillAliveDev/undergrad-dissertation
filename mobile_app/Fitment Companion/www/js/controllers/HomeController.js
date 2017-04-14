(function(){
	angular.module('starter')
            .controller('HomeController',['$scope','SocketService', HomeController]);
    /**
     * Constructor for the HomeConroller.
     * Makes logic available to the application homescreen
     *
     * @param $scope: Controller Scope
     * @param SocketService: Functions for he socket communication
     * @constructor Main functions for the home screen template
     */
    function HomeController($scope,SocketService){
        $scope.controllerData = { //Area to load the vehicle stats
            stats: {}
        };

        /**
         * Responds to the 'home:loadSuccess' broadcast and populates the controllerData
         */
        SocketService.on('home:loadSuccess', function(data){
            console.log(data);
            $scope.controllerData.stats = angular.fromJson(data);
        });


        //Updates numbers when ew items are added (Realtime Functionality)
        SocketService.on('vehicles:notif', function(){
            SocketService.emit('home:load'); //Reloads the controllerData
        });
        SocketService.on('part:notif', function(data){
            SocketService.emit('home:load');
        });
        SocketService.on('group:notif', function(data){
            SocketService.emit('home:load');
        });
    }
})();