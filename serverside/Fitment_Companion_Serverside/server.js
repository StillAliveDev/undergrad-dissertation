var io = require('socket.io')(6100);

var loginFunc = require('./js/login.js');
var vehFunc = require('./js/vehicle.js');
var partsFunc = require('./js/part.js');
var homeFunc = require('./js/home.js');
var groupFunc = require('./js/group.js');
var userFunc = require('./js/users.js');

io.on('connection', function(socket){
    //Handles Login broadcasts
    socket.on('user:login', function (data){
        loginFunc.doLogin(data, function(err,content){
           if(err){
               console.log(err);
               socket.emit('login:fail', err);
           }
           else{
               console.log(content);
               io.sockets.emit('login:notif');
               socket.emit('login:success', content);

           }
        });
    });

    //Handles logout broadcasts
    socket.on('user:logout', function(data){
        loginFunc.doLogout(data, function(err,content){
        if(err){
            console.log(err);
            socket.emit('logout:fail');
        }
        else{
            console.log(content);
            io.sockets.emit('logout:notif');
            socket.emit('logout:success');
        }
        });
    });

    //Handles response when user loads the list of vehicles
    socket.on('vehicles:loadList', function(){
       console.log('Request to reload Vehicles List Received');
       vehFunc.loadAllVins(function(err,content){
           if(err){
               console.log(err);
               socket.emit('vehicles:loadError',err);
           }
           else{
               console.log(content);
               socket.emit('vehicles:loadComplete',content);
           }
        });
    });

    socket.on('vehicles:loadFull', function(){
        console.log('Request to reload Full Vehicles List Received');
        vehFunc.loadAll(function(err,content){
            if(err){
                console.log(err);
                socket.emit('vehicles:loadFullFail',err);
            }
            else{
                console.log(content);
                socket.emit('vehicles:loadFullSuccess',content);
            }
        });
    });

    //Handles vehicle enquiry broadcasts
    socket.on('vehicle:enquire',function(vin){
        console.log('Vehicle Enquiry Request');
        vehFunc.enquire(vin, function(err,content){
            if(err){
                console.log(err.errorText);
                socket.emit('vehicle:enquiryFailed',err)
            }
            else{
                console.log(content);
                socket.emit('vehicle:enquirySuccess',content);
            }
        });
    })

    //Handles response when user refreshes the parts list
    socket.on('parts:loadList',function(){
        console.log('Request to reload Parts List Received');
        partsFunc.loadAllParts(function(err,content){
            if(err){
                console.log(err);
                socket.emit('parts:loadError', err);
            }
            else{
                console.log(content);
                socket.emit('parts:loadComplete', content);
            }
        });
    });

    //Handles part enquiry broadcasts
    socket.on('part:enquire', function(id){
        console.log('Part enquiry request');
        partsFunc.enquire(id, function(err,content){
            if(err){
                console.log(err);
                socket.emit('part:enquiryFail', err);
            }
            else{
                console.log(content);
                socket.emit('part:enquirySuccess', content);
            }
        });
    });

    //Handles response for mobile application home screen
    socket.on('home:load', function(){
        console.log('Request to load home screen data');

        homeFunc.loadHomeData(function(err, content){
            if(err){
                console.log(err);
                socket.emit('home:loadError', err);
            }
            else{
                console.log(content);
                socket.emit('home:loadSuccess', content);
            }
        });
    });

    //Handles broadcasts when user removes part from inventory

    socket.on('part:remove', function(data){
       console.log('Request to remove part from inventory');

       partsFunc.removePart(data,function(err,content){
           if(err){
               console.log(err);
               socket.emit('part:removeFail', err);
           }
           else{
               console.log(content);
               socket.emit('part:removeSuccess');
               io.sockets.emit('part:invNotif',content);
           }
       });
    });

    //Handles broadcasts when user returns part to inventory
    socket.on('part:return', function(data){
        console.log('Request to return part to inventory');

        partsFunc.returnPart(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('part:removeFail',err);
            }
            else{
                console.log(content);
                socket.emit('part:removeSuccess', content);
                io.sockets.emit('part:invNotif', content);
            }
        });
    });

    //Hendles starting a fitment group
    socket.on('group:start', function(data){
        console.log('Request to start a fitment group');

        groupFunc.start(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('group:startFail', err);
            }
            else{
                console.log(content);
                socket.emit('group:startSucc', content);
                io.sockets.emit('group:notif', content);
            }
        });
    });

    //Handles finishing a fitment group
    socket.on('group:finish', function(data){
        console.log('Request to finish a group');

        groupFunc.finish(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('group:finishFail', err);
            }
            else{
                console.log(content);
                socket.emit('group:finishSucc', content);
                io.sockets.emit('group:notif', content);
            }
        })
    });

    //Handles requests to add a vehicle
    socket.on('vehicle:add', function(data){
        console.log('Request to add vehicle');

        vehFunc.add(data, function(err,content){
            if(err){
                console.log(err);
                socket.emit('vehicle:addFail', err);
            }
            else{
                console.log(content);
                socket.emit('vehicle:addSuccess', content);
                io.sockets.emit('vehicle:notif', content);
            }
        })
    });

    //Handles requests to add a vehicle
    socket.on('vehicle:delete', function(data){
        console.log('Request to delete a vehicle');

        vehFunc.delete(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('vehicle:deleteFail',err);
            }
            else{
                console.log(content);
                socket.emit('vehicle:deleteSuccess',content);
                io.sockets.emit('vehicle:notif', content);
            }
        })
    });

    //Handles Requets to add a part
    socket.on('part:add', function(data){
        console.log('Request to add a part');

        partsFunc.addPart(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('part:addFail', err);
            }
            else{
                console.log(content);
                socket.emit('part:addSuccess', content);
                io.sockets.emit('part:notif', content);
            }
        })
    });

    //Handles requests to delete a part
    socket.on('part:delete', function(data){
        console.log("Request to delete a part");

        partsFunc.addPart(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('part:deleteFail', err);
            }
            else{
                console.log(content);
                socket.emit('part:deleteSuccess', content);
                io.sockets.emit('part:notif', content);
            }
        })
    });

    socket.on('users:loadFull',function(){
        console.log('Request to load all user data');

        userFunc.loadFull(function(err, content){
            if(err){
                console.log(err);
                socket.emit('users:loadFullFail', err);
            }
            else{
                console.log(content);
                socket.emit('users:loadFullSuccess', content);
            }
        })
    });

    socket.on('user:delete', function(data){
        console.log("Request to delete a user");

        userFunc.deleteUser(data, function(err, content){
            if(err){
                console.log(err);
                socket.emit('user:deleteFail', err);
            }
            else{
                console.log(content);
                socket.emit('user:deleteSuccess', content);
                io.sockets.emit('partNotif',content);
            }
        })
    })

    setInterval(function(){
        io.sockets.emit('test:emit');
    }, 2000);
});
