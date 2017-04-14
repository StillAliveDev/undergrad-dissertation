/**
 * Written by Luke Hussey w13015406
 * As part of the Individual Project module
 *
 * Serverside to support 'Fitment Companion' and 'Fitment Companion Web' Applications
 */

//Required modules
var io = require('socket.io')(6100);
var loginFunc = require('./js/login.js');
var vehFunc = require('./js/vehicle.js');
var partsFunc = require('./js/part.js');
var homeFunc = require('./js/home.js');
var groupFunc = require('./js/group.js');
var userFunc = require('./js/user.js');


/**
 * Acts as a router to respond to all clientside broadcasts (MOBILE APP and WEB APP)
 * Calling individual function from the required modules above.
 *
 * Sets up a reference to a connected client using 'socket'. Each client provides a 'connection' broadcast to identify
 * that it is a connected client.
 *
 * Each listener, identified by 'socket.on' have the possibility to be used by both the Web and Mobile App,
 * However, most are specialised to either one or another.
 *
 * This script's functions are separated into: LOGIN/LOGOUT, HOME SCREEN, VEHICLES, PARTS, GROUPS and USERS
 *
 * @param socket: connected client information, references to client making each broadcast.
 *              Data is sent back to this client for specific responses required for only them.
 *              io.sockets.emit is used to send data to all connected clients.
 */
io.on('connection', function(socket){

    /************************************* LOGIN/LOGOUT ***********************************/

    /**
     *  Responds to user login attempts with socket broadcast 'user:login' (BOTH)
     *
     *  @param data - Data sent from user login screen (data.username, data.pass)
     */
    socket.on('user:login', function (data){
        //Calls the login function in login.js, with callback function (err, content)
        loginFunc.doLogin(data, function(err,content){
           if(err){
               console.log(err);
               //Emit back to the sending client 'login:fail'
               socket.emit('login:fail', err);
           }
           else{
               console.log(content);
               //Emit back to the sending client 'login:success'
               socket.emit('login:success', content);
               //Emit to all connection clients the same data wih 'login:notif' broadcast
               io.sockets.emit('login:notif', content);

           }
        });
    });

    /**
     * Responds to user logout attempts with socket broadcast 'user:logout' (BOTH)
     *
     * @param data: user session data for the currently signed in user.
     */
    socket.on('user:logout', function(data){
        //Calls the doLogout function from login.js
        loginFunc.doLogout(data, function(err,content){
        if(err){
            console.log(err);
            //Emit to connected client 'logout:fail'
            socket.emit('logout:fail');
        }
        else{
            console.log(content);
            //Emit to the connection client 'logout:success'
            socket.emit('logout:success');
            //Emit to all connected clients the same data.
            io.sockets.emit('logout:notif', content);
        }
        });
    });

    /************************************************ HOME SCREEN **********************************/

    /**
     * Responds to client broadcast 'home:load' (MOBILE APP)
     */
    socket.on('home:load', function(){
        console.log('Request to load home screen data');
        //Calls the loadHomeData function from home.js with callback function
        homeFunc.loadHomeData(function(err, content){
            if(err){
                console.log(err);
                //Emit an error in loading the data to the calling client
                socket.emit('home:loadError', err);
            }
            else{
                console.log(content);
                //Emit success and data to the connected client
                socket.emit('home:loadSuccess', content);
            }
        });
    });

    /**
     * Responds to the client broadcast 'home:loadFull' Slightly different to 'home:load' as
     * it contains more data (WEB APP)
     */
    socket.on('home:loadFull', function(){
        console.log('Request to load home screen data (WEB)');
        //Call the homeLoadDataWeb function from home.js with callback function
        homeFunc.homeLoadDataWeb(function(err, content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('home:loadFullFail', err);
            }
            else{
                console.log(content);
                //Emit success to the calling client
                socket.emit('home:loadFullSuccess', content);
            }
        });
    });

    /************************************************ VEHICLES *********************************************/

    /**
     * Responds to the client broadcast 'vehicles:loadList'
     * Loads vin list (MOBILE APP)
     */
    socket.on('vehicles:loadList', function(){
       console.log('Request to reload Vehicles List Received');
       //Call loadAllVins from vehicle.js with callback function
       vehFunc.loadAllVins(function(err,content){
           if(err){
               console.log(err);
               //Emit error to calling client
               socket.emit('vehicles:loadError',err);
           }
           else{
               console.log(content);
               //Emit success to calling client
               socket.emit('vehicles:loadComplete',content);
           }
        });
    });

    /**
     * Responds to the client broadcast 'vehicles:loadFull'
     * Used to load full vin data for each record, and relevant counts
     * (Intended for use with the (WEB APP)
     */
    socket.on('vehicles:loadFull', function(){
        console.log('Request to reload Full Vehicles List Received');
        //Call loadAll from vehicle.js with callback function
        vehFunc.loadAll(function(err,content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('vehicles:loadFullFail',err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('vehicles:loadFullSuccess',content);
            }
        });
    });

    /**
     * Responds to 'vehicle:enquire' client broadcasts, returns all data
     * for a given vehicle, including fitment_groups,operations and parts
     * (MOBILE APP)
     *
     * @param vin : vehicle to enquire
     */
    socket.on('vehicle:enquire',function(vin){
        console.log('Vehicle Enquiry Request');
        //Call enquire from vehicles.js with callback function
        vehFunc.enquire(vin, function(err,content){
            if(err){
                console.log(err.errorText);
                //Emit error to calling client
                socket.emit('vehicle:enquiryFailed',err)
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('vehicle:enquirySuccess',content);
            }
        });
    });

    /**
     * Responds to client broadcast 'vehicle:add'. To allow the user to add a vehicle
     * to the database (WEB APP)
     *
     * @param data: eventUser - the username of the calling client, vehicle - the vehicle to add
     */
    socket.on('vehicle:add', function(data){
        console.log('Request to add vehicle');
        //Call add from vehicle.js with callback function
        vehFunc.add(data, function(err,content){
            if(err){
                console.log(err);
                //Emit error to the calling client
                socket.emit('vehicle:addFail', err);
            }
            else{
                console.log(content);
                //Emit success and data to the calling client
                socket.emit('vehicle:addSuccess', content);
                //Emit data to all connected client to server as a broadcast
                io.sockets.emit('vehicles:notif', content);
            }
        });
    });

    /**
     * Responds to client broadcast 'vehicle:delete'. This allows the deletion of the vehicle,
     * with a given vin (WEB APP)
     *
     * @param data: eventUser - the calling client, vin - the vehicle to delete
     */
    socket.on('vehicle:delete', function(data){
        console.log('Request to delete a vehicle');
        //Call delete in vehicle.js with callback function
        vehFunc.delete(data, function(err, content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('vehicle:deleteFail',err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('vehicle:deleteSuccess',content);
                //Emit content to all connected clients
                io.sockets.emit('vehicles:notif', content);
            }
        });
    });

    /******************************************** PARTS *********************************************/

    /**
     * Responds to client broadcast 'parts:loadList'.
     * To load the list of parts (MOBILE APP)
     */
    socket.on('parts:loadList',function(){
        console.log('Request to reload Parts List Received');

        //Call loadALlParts in part.js with callback function
        partsFunc.loadAllParts(function(err,content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('parts:loadError', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with parts data.
                socket.emit('parts:loadComplete', content);
            }
        });
    });

    /**
     * Responds to client broadcast 'part:enquire' to load details about a given part id
     * (MOBILE APP)
     * @param id : part id to enquire
     */
    socket.on('part:enquire', function(id){
        console.log('Part enquiry request');
        //Call enquire from part.js with callback function
        partsFunc.enquire(id, function(err,content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('part:enquiryFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with part data
                socket.emit('part:enquirySuccess', content);
            }
        });
    });

    /**
     * Responds to client broadcast 'part:remove' to remove a part from inventory
     * (MOBILE APP)
     *
     * @param data: part data to remove
     */
    socket.on('part:remove', function(data){
       console.log('Request to remove part from inventory');
        //Call removePart from part.js with callback function
       partsFunc.removePart(data,function(err,content){
           if(err){
               console.log(err);
               //Emit error to calling client
               socket.emit('part:removeFail', err);
           }
           else{
               console.log(content);
               //Emit success to calling client
               socket.emit('part:removeSuccess');
               //Emit event to all connected clients.
               io.sockets.emit('part:notif',content);
           }
       });
    });

    /**
     * Responds to client broadcast 'part:return'.
     * Allow user to return a part to inventory (MOBILE APP)
     *
     * @param data :  part to return
     */
    socket.on('part:return', function(data){
        console.log('Request to return part to inventory');

        //Calls return part from part.js
        partsFunc.returnPart(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('part:removeFail',err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('part:removeSuccess', content);
                //Emit event to all connected clients as a notification
                io.sockets.emit('part:notif', content);
            }
        });
    });

    /**
     * Responds to 'part:add' broadcasts.
     * Allows a user to add a part to the database
     * (WEB APP)
     *
     * @param data: the part to add
     */
    socket.on('part:add', function(data){
        console.log('Request to add a part');
        //Calls addpart in part.js with callback function
        partsFunc.addPart(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('part:addFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling cleint
                socket.emit('part:addSuccess', content);
                //Emit content to all connected clients as a notification
                io.sockets.emit('part:notif', content);
            }
        });
    });

    /**
     * Responds to 'parts:loadFull' broadcasts
     * (WEB APP)
     */
    socket.on('parts:loadFull', function(){
        console.log("Request to load all part information");
        //Call loadFull from parts.js with callback function
        partsFunc.loadFull(function(err, content){
            if(err){
                console.log(err);
                //Emit error to calling client
                socket.emit('parts:loadFullFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with parts data
                socket.emit('parts:loadFullSuccess', content);
            }
        });
    });

    /**
     * Responds to 'part:delete' client broadcasts.
     * Allows a user to delete a given part (WEB APP)
     *
     * @param data: part to delete
     */
    socket.on('part:delete', function(data){
        console.log("Request to delete a part");
        //Call deletePart from part.js with callback function
        partsFunc.deletePart(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('part:deleteFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('part:deleteSuccess', content);
                //Emit content to all clients as notification
                io.sockets.emit('part:notif', content);
            }
        });
    });

    /******************************************************* GROUPS *******************************************/

    /**
     * Responds to 'group:start' noifications (MOBILE APP)
     *
     * @param data: data containing the group information
     */
    socket.on('group:start', function(data){
        console.log('Request to start a fitment group');
        //Call start from group.js with callback function
        groupFunc.start(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('group:startFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('group:startSucc', content);
                //Emit to all connected clients as a notification
                io.sockets.emit('group:notif', content);
            }
        });
    });

    /**
     * Responds to 'group:finish' client broadcasts (MOBILE APP)
     *
     * @param data: the group information
     */
    socket.on('group:finish', function(data){
        console.log('Request to finish a group');
        //Call finish from group.js with callback function
        groupFunc.finish(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('group:finishFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('group:finishSucc', content);
                //Emit to all connected clients as a notification
                io.sockets.emit('group:notif', content);
            }
        });
    });

    /**
     * Responds to 'groups:loadFull' client broadcasts (WEB APP)
     */
    socket.on('groups:loadFull', function(){
        console.log("Request to load fitment group information");
        //Call loadFull in group.js with callback function
        groupFunc.loadFull(function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('groups:loadFullFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with group data
                socket.emit('groups:loadFullSuccess', content);
            }
        });
    });

    /**
     * Responds to 'group:delete' client broadcasts (WEB APP)
     *
     * @param data: group to delete
     */
    socket.on('group:delete', function(data){
        console.log("Request to delete a group");
        //Call delete from group.js with callback function
        groupFunc.delete(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('group:deleteFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('group:deleteSuccess', content);
                //Emit to all connected clients as a braodcast
                io.sockets.emit('group:notif', content)
            }
        });
    });

    /**
     * Responds to 'fitmentResources:load' client broadcasts (WEB APP)
     * Intended to return parts and vehicle to not assigned to display on
     * the add fitments screen.
     */
    socket.on('fitmentResources:load', function(){
        console.log("Request to load vehicles and parts for the fitment creation screen");
        //Call partsVinsNotInFitment in group.js wth callback
        groupFunc.partsVinsNotInFitment(function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('fitmentResources:loadFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with data
                socket.emit('fitmentResources:loadSuccess', content);
            }

        });
    });

    /******************************************************** USERS *******************************************/

    /**
     * Responds to client broadcast 'users:loadFull' (WEB APP)
     */
    socket.on('users:loadFull',function(){
        console.log('Request to load all user data');
        //Call loadFull in user.js with callback function
        userFunc.loadFull(function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('users:loadFullFail', err);
            }
            else{
                console.log(content);
                //Emit success to calling client with data
                socket.emit('users:loadFullSuccess', content);
            }
        });
    });

    /**
     * Responds to client broadcast 'user:delete' to delete a user (WEB APP)
     *
     * @param data: the user to delete
     */
    socket.on('user:delete', function(data){
        console.log("Request to delete a user");
        //Call deletUser in user.js with callback function
        userFunc.deleteUser(data, function(err, content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('user:deleteFail', err);
            }
            else{
                console.log(content);
                //EMit success to calling client
                socket.emit('user:deleteSuccess', content);
                //Emit to all connected clients as a notification
                io.sockets.emit('users:notif',content);
            }
        });
    });

    /**
     * Responds to 'user:add' client broadcasts (WEB APP)
     *
     * @param data: the user to add to the database
     */
    socket.on('user:add', function(data){
        console.log("Request to add a user");
        //Call add in user.js
        userFunc.add(data, function(err,content){
            if(err){
                console.log(err);
                //Emit fail to calling client
                socket.emit('user:addFail',err);
            }
            else{
                console.log(content);
                //Emit success to calling client
                socket.emit('user:addSuccess', content);
                //Emit to all connected clients as a notification
                io.sockets.emit('users:notif', content);
            }
        });
    });
});
