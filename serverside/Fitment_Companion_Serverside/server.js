var io = require('socket.io')(6100);

var loginFunc = require('./js/login.js');

io.on('connection', function(socket){
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

    socket.on('user:logout', function(data){
        loginFunc.doLogout(data, function(err,content){

        });
    });
});
