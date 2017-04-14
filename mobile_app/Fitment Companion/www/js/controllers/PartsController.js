(function(){
	angular.module('starter')
	.controller('PartsController',['$scope','$rootScope','$ionicPopup','SocketService', PartsController]);

    /**
     * Constructor for the PartsController
     * @param $scope: Controller Scope
     * @param $rootScope: Application Scope
     * @param $ionicPopup: Ionic UI Popup functions
     * @param SocketService: Realtime socket communication functions
     * @constructor Constructor for PartsController, makes functions available to the HTML template page
     */

	function PartsController($scope,$rootScope,$ionicPopup,SocketService){

	    //Data to be used in this controller
		$scope.controllerData = {
			partsList : [], //List of parts
			partDetails:{ //Used with the ionic popup
				part:{}
			},
			partsScan: {
                toRemove: false,//Am i expecting to remove the part (Or add it)?
                correctPart: true //Is the part scanned the one expected?
            },
			expectedTag:"part" //Type of tag to expect
		};

        /**
         * Function to load data in the main list for this screen
         */
		$scope.loadList = function(){
		    //Request data from the serverside
		    SocketService.emit('parts:loadList');

		    //When the server responds with success
		    SocketService.on('parts:loadComplete', function(data){
		       console.log('loading complete ' + data);

		       $scope.controllerData.partsList = angular.fromJson(data); //Populate the controllerData
                //Stop the ionic refesher (UI Element 'Pull to Refresh')
		       $rootScope.$broadcast('scroll.refreshComplete');

		       //Remove the listener to avoid duplicates
		       SocketService.removeListener('parts:loadComplete');
            });
		    //When there is an error
		    SocketService.on('parts:loadError',function(data){
		        console.log(data);
		        var ep = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Could not load parts'
                });
            });

        };

        /**
         * Function to open the detail modal for a select part
         * @param part: id of the selected part
         */
		$scope.openPart = function(part){
			console.log('Opening Part Popup');
			//Load part details from server
            SocketService.emit('part:enquire',part);
            //When success
            SocketService.on('part:enquirySuccess', function(data){
                console.log(data);
                $scope.controllerData.partDetails = angular.fromJson(data); //Populate controllerData
                SocketService.removeListener('part:enquirySuccess');
            });

			var partPopup = $ionicPopup.confirm({ //Show the popup
				title: 'Part Detail',
				templateUrl: 'templates/partDetailModal.html',
				scope: $scope
			});
		};

        /**
         * Function to open the scan popup for a selected part
         */
		$scope.openPartScan = function(){
			console.log('Opening Part Scan Popup');
			$scope.partScanPopup = $ionicPopup.confirm({ //Open the popup
				title: 'Part Enquire',
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});
			//Add the NFC listener --Waiting for a ag to be present
			$scope.listenForNFC();

		};

        /**
         * Handler for an NFC scan event
         * DOES NOT WORK IN BROWSER OR IONIC SERVE
         * Application must be run on an android device for this to be accessible
         * as Cordova plugins are written in JAVA
         *
         * NFC data is in the structure:
         * {"type":"part","id":partid}
         * Where part ID is an integer.
         * @param nfcEvent
         */
        function nfcHandler(nfcEvent){

            var tag = nfcEvent.tag; //Tag data
            var ndefMessage = tag.ndefMessage; //Data contents (binary)
            //Converts binary data to string
            var payload = nfc.bytesToString(ndefMessage[0].payload);

            //Converts payload into JSON objects to that individual variables can be directly referenced
            //Payload needs to be trilled to ignore the first 3 chars (Special characters and encoding language)
            json = angular.fromJson(payload.slice(3));
            console.log(payload.slice(3));

            //Remove the NFC listener now
            $scope.stopListeningForNFC();

            //Check the tag is the correct type.
            if((json.type == 'part') && ($scope.controllerData.expectedTag == 'part')){
                $scope.partScanPopup.close();
                //This needs to remove it from inventory after checking if its the part we expect
                $scope.openPart(json.id); //Open the part modal
            }
        }

        /**
         * Function to remove the NFC event listener
         * DOES NOT WORK IN BROWSER OR IONIC SERVE
         */
        $scope.stopListeningForNFC = function(){
            //Calls the function in the NFC cordova module to remove the listener
            nfc.removeNdefListener(
                nfcHandler, // this must be the same as the function above
                function () { //When removal success
                    console.log('NFC Listener Removed');
                },
                function (error) {//When fail
                    alert('Removing the listener failed: ' + error);
                }
            );
        };

        /**
         * Function to create the NFC event listener
         * DOES NOT WORK IN BROWSER OR IONIC SERVE
         */
        $scope.listenForNFC = function() {
            nfc.addNdefListener( //Listen for a tag (Call cordova module)
                nfcHandler,
                function(){
                    console.log('Listening for a tag');
                },
                function(error){
                    console.log('Error adding listener: ' + error);
                }
            );
        };
	}
	
})();