var io = require('socket.io')(6100);

var loginFunc = require('./js/login.js');
var vehFunc = require('./js/vehicle.js');
var partsFunc = require('./js/part.js');
var homeFunc = require('./js/home.js');

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
               io.sockets.emit('login:login');
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
            io.sockets.emit('logout:logout');
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
});
