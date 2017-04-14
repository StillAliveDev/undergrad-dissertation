(function(){
	angular.module('starter')
	.controller('VehiclesController',['$scope','$rootScope','$ionicPopup','SocketService', VehiclesController]);

    /**
	 * Constructor for the VehiclesController Module
     * @param $scope: Controller Scope
     * @param $rootScope: Application scope - shared between all contorollers
     * @param $ionicPopup: Ionic Popup (UI) functions
     * @param SocketService: Functions for realtime communication with the server
     * @constructor VehiclesController, makes logic available to the vehicles HTML template
     */
	function VehiclesController($scope,$rootScope,$ionicPopup,SocketService){

		//Data for the current controller
		$scope.controllerData = {
			list : { //Main list
				vehicles:[],
				total:0,
				in_fitments:0
			},
			vehicleDetails : {}, //Individual vehicles details (Popup)
			partDetails : { //Individual Part details (Popup)
                part: {}
            },
			fitmentConfirm:{ //Data for the fitment complete popup
				incomplete:false,
				incompleteNotes:""
			},
			partsScan:{ //Data for the parts scan popup
				toRemove:true, // is this to remove or replace the part
				correctPart:true //is this the part im expecting?
			},
			expectedTag:"" //Expected tag vehicle or part
		};


        /**
		 * Function to load the main list with vehicles
         */
		$scope.loadList = function(){
			//Send request for vehicle data.
		    SocketService.emit('vehicles:loadList');

		    //When request successful
            SocketService.on('vehicles:loadComplete', function(data){
		        console.log('loading complete ' + data);
		        $scope.controllerData.list = angular.fromJson(data); //populate the controller data
		        SocketService.removeListener('vehicles:loadComplete'); //Remove the listener, avoids duplicates.
            });
            //When error
            SocketService.on('vehicles:loadError', function(data){
                console.log(data);
                var ep = $ionicPopup.alert({
					title: 'Error',
					template: 'Error loading vehicle information'
				});
                SocketService.removeListener('vehicles:loadError');
            });
            //Remove the ionic refresh UI element
            $rootScope.$broadcast('scroll.refreshComplete');
        };

        /**
		 * Function to open the vehicle information modal
         * @param vin: vin to display
         */
		$scope.openVIN = function(vin){
			console.log('Opening Vehicle Detail Popup');
			$scope.getVehicleDetails(vin); //Load the vehicle information
			var vehiclePopup = $ionicPopup.confirm({
				title: 'Selected Vehicle',
				templateUrl: 'templates/vehicleDetailModal.html',
				scope: $scope
			});
		};

        /**
		 * Function to open the vehicle group popup when a group is selected from the
		 * vehicle details modal.
         * @param group: the group id selected
         */
		$scope.openGroup = function(group){
			console.log('Opening Group Detail Popup');
			$scope.groupPopup = $ionicPopup.confirm({
				title: 'Fitment Detail',
				templateUrl: 'templates/fitmentGroupDetailModal.html',
				scope: $scope,
				buttons: [ //Custom defined buttons
					{text: 'Close'},
					{
						text: 'Start/Finish',
						type: 'button-positive',
						onTap: function(e) {
							e.preventDefault(); //Stops the modal from closing.
							$scope.startFinishGroup(group);
						}
					}
				]

			});
		};

        /**
		 * Function to either start or finish a fitment group
         * @param group: group to start or finish
         */
		$scope.startFinishGroup = function(group){
			var data = { //Payload
				group_id: group.FIT_GROUP_ID,
				user_id : $rootScope.user_id,
				user_name: $rootScope.user_name
			};
			console.log($rootScope.user_id);
			//Starting the group
			if(group.IN_PROGRESS == 'FALSE'){
				SocketService.emit('group:start', data);
				SocketService.on('group:startSucc', function(data){
					console.log(data);
                    $scope.getVehicleDetails($scope.controllerData.vehicleDetails.vehicle.VIN);
                    $scope.groupPopup.close();
                    SocketService.removeListener('group:startSucc');
				});
			}
			//Finishing the group
			else if(group.IN_PROGRESS == 'TRUE'){
				$scope.completeFitment(group); //Opens the notes modal.

				$scope.groupPopup.close();
			}
		};

        /**
		 * Function to finish a group
         * @param group: the group to finish
         */
		$scope.completeFitment = function(group){
			//Clear vars (If the user closes and reopens, form is cleared)
            $scope.controllerData.fitmentConfirm.incompleteNotes = ""; //Clears the notes inputs
            $scope.controllerData.fitmentConfirm.incomplete = 'FALSE'; //Uncheck the incomplete option
			$scope.completePopup  = $ionicPopup.confirm({
                title: 'Finish Fitment',
                templateUrl: 'templates/fitmentCompleteConfirm.html',
                scope: $scope,
				buttons: [
					{text: 'Cancel'}, //Custom buttons
					{
						text: 'Finish',
						type: 'button-positive',
						onTap: function(e){
							e.preventDefault(); //Stop the modal from closing

                            var data = { //Payload
                                group_id: group.FIT_GROUP_ID,
                                user_id : $rootScope.user_id,
                                user_name: $rootScope.user_name,
								incomplete: $scope.controllerData.fitmentConfirm.incomplete,
								incomplete_notes: $scope.controllerData.fitmentConfirm.incompleteNotes
                            };
							//Send request to finish the group
							SocketService.emit('group:finish', data);
                            SocketService.on('group:finishSucc', function(data){
                                console.log(data);
                                $scope.getVehicleDetails($scope.controllerData.vehicleDetails.vehicle.VIN);
                                $scope.controllerData.fitmentConfirm.incompleteNotes = "";
                                $scope.controllerData.fitmentConfirm.incomplete = 'FALSE';
                                SocketService.removeListener('group:finishSucc');
                                $scope.completePopup.close();//Close the popup
                            });

						}
					}
				]
            });

		};

        /**
		 * Function to open the part associated with a fitment group
         * @param part: part to display
         */
		$scope.openPart = function(part){
			console.log('Opening Part Popup');
			$scope.partEnquiry(part); //Collects the part information
			var partPopup = $ionicPopup.confirm({
				title: 'Part Detail',
				templateUrl: 'templates/partDetailModal.html',
				scope: $scope
			});
		};

        /**
		 * Function to open the part scan popup
         */
		$scope.openPartScan = function(){
			console.log('Opening Part Scan Popup');
            $scope.controllerData.partsScan.correctPart = true; //Resets to true -- Hides the error ui element
			$scope.partScanPopup = $ionicPopup.confirm({
				title: "Remove/Replace Part",
				templateUrl: 'templates/partScanModal.html',
				scope: $scope
			});
			$scope.controllerData.expectedTag = "part"; //Setup the tag expected
            $scope.listenForNFC(); //Start listening for NFC
		};

        /**
		 * Function to open the vehicleScan popup --Vin Enquiry
         */
		$scope.openVehicleScan = function(){
			console.log('Opening Vehicle Scan Popup');
			$scope.vehicleScanPopup = $ionicPopup.confirm({
				title: 'Vehicle Enquire',
				templateUrl: 'templates/vehicleScanModal.html',
				scope: $scope
			});
			$scope.controllerData.expectedTag = "veh"; //Sets the expected tag to Vehicle
            $scope.listenForNFC();//Start listening for NFC
		};

        /**
		 * Function to check if the scanned part is the one expected.
         * @param id: the part id.
         */
		$scope.processPart = function(id){
			if(id == $scope.controllerData.partDetails.part.PART_ID){
				$scope.partScanPopup.close();
				$scope.returnRemovePart(id); //Return or remove part from inventory
			}
			else{//Incorrect Part
				$scope.controllerData.partsScan.correctPart = false;
				$scope.$apply(); // Refreshes the View
			}
		};

        /**
		 * Function to run a part enquiry for the selected fitment_group and vehicle
         * @param part: the part id to enquire
         */
		$scope.partEnquiry = function(part){
			//Server request
            SocketService.emit('part:enquire',part);
            SocketService.on('part:enquirySuccess', function(data){
                console.log(data);
                $scope.controllerData.partDetails = angular.fromJson(data); //Populate the controllerData
                SocketService.removeListener('part:enquirySuccess');//Remove socket listener to avoid duplicates.
            });
		};

        /**
		 * Function to run a vehicle enquiry for a selected/scanned vin
         * @param vin : vehicle to enquire
         */
		$scope.getVehicleDetails = function(vin){
            SocketService.emit('vehicle:enquire', vin);
            SocketService.on('vehicle:enquirySuccess', function(data){
                console.log('loading complete ' + data);
                $scope.controllerData.vehicleDetails = angular.fromJson(data);
                SocketService.removeListener('vehicle:enquirySuccess');//avoid listener duplicates
            });
		};

        /**
		 * Function to return or remove a part depending on if it is in or out of inventory
         * @param id: part to remove or return
         */
		$scope.returnRemovePart = function(id){
            var data = { //Payload
                username: $rootScope.user_name,
                part_id : id
            };
			if($scope.controllerData.partDetails.part.IN_INVENTORY == "FALSE"){ //Return the part
                console.log('Returning Part' + id);
                SocketService.emit('part:return',data);
                SocketService.on('part:returnSuccess',function(data){
                	console.log('part returned : ' + data);
				});
			}
			else{//Remove the part
				console.log('Removing Part' + id);
				SocketService.emit('part:remove', data);
				SocketService.on('part:removeSuccess', function(data){
					console.log('part removed : ' + data);
				});
			}
            $scope.partEnquiry(id); //Refresh the previous screens
			$scope.getVehicleDetails($scope.controllerData.vehicleDetails.vehicle.VIN);

		};

        /**
		 * Function to stop listening for an NFC scan event
		 * DEVICE DEPENDANT: DOES NOT WORK IN BROWSER or IONIC SERVE
         */
		$scope.stopListeningForNFC = function(){
            nfc.removeNdefListener(//Remove listener
                nfcHandler, // this must be the same as the function above
                function () {//Success
                    console.log('NFC Listener Removed');
                },
                function (error) {//No Success
                    alert('Removing the listener failed: ' + error);
                }
            );
		};

        /**
		 * Function to start listening for an NFC scan event
		 * DEVICE DEPENDANT: DOES NOT WORK IN BROWSER or IONIC SERVE
         */
		$scope.listenForNFC = function() {
            nfc.addNdefListener(//Create listener
                nfcHandler,
                function(){ //Success
                    console.log('Listening for a tag');
                },
                function(error){//No Success
                    console.log('Error adding listener: ' + error);
                }
            );
		};

        /**
		 * Handler Function to perform when an NFC tag is scanned(nfcEvent triggered).
         * @param nfcEvent: the NFC event
         */
        function nfcHandler(nfcEvent){

            var tag = nfcEvent.tag;//Gets the tag
            var ndefMessage = tag.ndefMessage;//Tag contents
            var payload = nfc.bytesToString(ndefMessage[0].payload);//Contents data (binary to string)

			//Slice to remove first 3 chars.. Encoded language and data start special character.
            json = angular.fromJson(payload.slice(3));
            console.log(payload.slice(3));

            //Stop listening now
            $scope.stopListeningForNFC();

            //Check the type of tag scanned against what is expected.
            if((json.type == 'veh') && ($scope.controllerData.expectedTag == 'veh')){
                $scope.vehicleScanPopup.close();
                $scope.openVIN(json.id);
            }
            if((json.type == 'part') && ($scope.controllerData.expectedTag == 'part')){
                //This needs to remove it from inventory after checking if its the part we expect
                $scope.processPart(json.id);
            }
        }
	}
	
})();