/**
 * Module for the application home screen
 */

'use strict';
angular.module('myApp.home', ['ngRoute', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider){
        //Route Setup
        $routeProvider.when('/home', {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'//Links the controller to the template
        });
    }])

    .controller('HomeController', function($location, $window, $rootScope, $scope, SocketService){
        //Remove socket listeners to avoid duplicates from other pages.
        SocketService.removeAllListeners();
        //Current User.
        $scope.currentUser = {
            id: $window.sessionStorage.user_id,
            user_name:$window.sessionStorage.user_name
        };

        //Controller Data.
        $scope.controllerData = {
            users:{},
            parts:{},
            vehicles:{},
            fitments:{},
            error:false,
            events:[],
            currentError:""

        };

        /*Page Functions*/

        /**
         * Function to load all statistics for:
         * Vehicles, Fitments, Parts and Users.
         */
        $scope.loadAllStats = function(){
            //Server Request
            SocketService.emit('home:loadFull');
            SocketService.on('home:loadFullSuccess', function(data){//If Success
                console.log(data);
                var res = angular.fromJson(data);
                $scope.controllerData.error = false;
                $scope.controllerData.currentError = "";

                //Update controller Data.
                $scope.controllerData.users = res.users;
                $scope.controllerData.parts = res.parts;
                $scope.controllerData.vehicles = res.vehicles;
                $scope.controllerData.fitments = res.fitments;

                SocketService.removeListener('home:loadFullSuccess');
            });
            SocketService.on('home:loadFullFail', function(data){ //If Fail
                $scope.controllerData.error = true;
                $scope.controllerData.currentError = "Error retrieving statistics";
            });
        };

        /**
         * Function to proccess all realtime notifications
         * Used to determine the type of message to display on the realtime ticker
         * @param eventType:
         *              'P' : For part notifications,
         *              'V' for vehicle notifications,
         *              'G' For group notifications,
         *              'L' for Login/Logout notifications,
         *              'U' For user notifications,
         * @param event:
         *              'A' - Add (All Types)
         *              'D' - Delete (All Types)
         *              'S' - Start Group (Fitment Groups)
         *              'F' - Finish Groups (Fitment Groups)
         *              'I' - Login (login/logout)
         *              'O' - Logout (login/logout)
         *              'Ret' - Return Part to inventory (Parts)
         *              'R' - Remove Part from inventory (Parts)
         *
         * @param eventUser: The user who initiales the event... Described mostly as 'calling client' in other modules
         */
        $scope.proccessNotif = function(eventType, event, eventUser){
            var eventData = { //Structure for the noification
                type:eventType,
                user:eventUser, //Calling client
                text:"" //Notification message
            };

            //Decision on event type and value
            //Each case defines the message to display for each event type.
            switch(eventType){
                case 'P':
                    switch(event){
                        case 'A':
                            eventData.text = "added a new Part";
                            break;
                        case 'D':
                            eventData.text = "deleted a Part";
                            break;
                        case 'Ret':
                            eventData.text = "returned a Part to inventory";
                            break;
                        case 'R': eventData.text = "removed a Part from inventory";
                    }
                    //Updates the ticker
                    $scope.updateTicker(eventData);
                    break;
                case 'V':
                    switch(event){
                        case 'A':
                            eventData.text = "added a new Vehicle";
                            break;
                        case 'D':
                            eventData.text = "deleted a Vehicle";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'G':
                    switch(event){
                        case 'A':
                            eventData.text = "created a new Group";
                            break;
                        case 'D':
                            eventData.text = "deleted a Fitment Group";
                            break;
                        case 'F':
                            eventData.text = "finished a Fitment Group";
                            break;
                        case 'S':
                            eventData.text = "started a Fitment Group";
                            break
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'L':
                    switch(event){
                        case 'I':
                            eventData.text = "logged in";
                            break;
                        case 'O':
                            eventData.text = "logged out";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
                case 'U':
                    switch(event){
                        case 'A':
                            eventData.text = "created a new User";
                            break;
                        case 'D':
                            eventData.text = "deleted a User";
                            break;
                    }
                    $scope.updateTicker(eventData);
                    break;
            }
        };

        /**
         * Function to update the onscreen realtime ticker.
         * @param eventData: the calling client username, and message text (determined in processNotif)
         */
        $scope.updateTicker = function(eventData){
            console.log("Updating Ticker " + eventData.user + " " + eventData.text + " " + eventData.type);

            //'unshift' -- puts items in the first element of the ticker array, shuffles everything else down

            //Could this be saved to a cookie for persistence?
            //Could be something to consider in the future....
            $scope.controllerData.events.unshift({
                timestamp: new Date().getTime(), //Timestamp of the notification.
                type: eventData.type,
                text: eventData.text,
                user: eventData.user
            });

        };

        /**
         * Function to load all statistics when the page loads.
         */
        $scope.$on('$viewContentLoaded', function(){
            $scope.loadAllStats();
        });

        /*Realtime Notifications: Refreshes the statistics adn updates realtime ticker.*/
        SocketService.on('part:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('P', data.notifType, data.eventUser);
        });
        SocketService.on('vehicles:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('V', data.notifType, data.eventUser);
        });
        SocketService.on('group:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('G', data.notifType, data.eventUser);
        });
        SocketService.on('login:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('L','I', data[0].user_name);
        });
        SocketService.on('logout:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('L','O', data[0].user);
        });
        SocketService.on('users:notif', function(data){
            var data = angular.fromJson(data);
            $scope.loadAllStats();
            $scope.proccessNotif('U',data.notifType, data.eventUser);
        });


        /*Navbar Functions*/
        /**
         * Function to log the current user out when the logout button is pressed
         * in the nav bar.
         */
        $scope.logout = function(){
            var data = {
                userid : $scope.currentUser.id,
                username: $scope.currentUser.user_name
            };
            //Server request
            SocketService.emit('user:logout', angular.toJson(data));
        };


        //When logout success.
        SocketService.on('logout:success', function(){
            $window.sessionStorage.user_id = {};//Clear data.
            $window.sessionStorage.user_name = {};
            $location.path('/login'); //Navigate to the login screen
        });

        /**
         * The following functions navigate to other pages in the application
         * based on what is pressed in the nav bar.
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

        $scope.navHome = function(){
            $location.path('/home');
        };

    });