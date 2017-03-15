var io = require('socket.io')(6100);
var mysql = require('mysql');

var db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : 'password',
    database    : 'fitment_app'
});
console.log('Connection Setup, waiting for messages');

io.on('connection', function(socket){
    socket.on('user:login', function (data){

        var username = data.username;
        var password = data.pass;

        console.log('User login attempt from application ' + username + ' ' + password);

        socket.emit('login:success');
    });

    socket.on('user:logout', function(data){
        var username = data.username;

        console.log('User Logout detected. User: ' + username);
    });
});


/*
connection.query('SHOW TABLES', function(err,rows,fields) {
    if(!err)
        console.log('the solution is: ', rows);
    else
        console.log('error while perfoming query.');
});
*/
