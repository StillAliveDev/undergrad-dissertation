var io = require('socket.io')(6100);

var loginFunc = require('./js/login.js');
var vehFunc = require('./js/vehicle.js');
var partsFunc = require('./js/part.js');

io.on('connection', function(socket){
    //Handles Login Nroadcasts
    socket.on('user:login', function (data){

        loginFunc.doLogin(data, function(err,content){
           if(err){
               console.log(err);
               socket.emit('login:fail', err);
           }
           else{
               console.log(content);
               socket.emit('login:success', content);
           }
        });
    });

    //Handles logout broadcasts
    socket.on('user:logout', function(data){
        loginFunc.doLogout(data, function(err,content){

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
});
