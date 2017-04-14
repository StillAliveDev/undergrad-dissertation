var mysql = require('mysql');

//Set up the Database connection
var db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : 'password',
    database    : 'fitment_app'
});

// Send to console status of connection upon startup
db.connect(function(err){
   if(err){
       console.log('Error Connection to Database');
       return;
   }
   console.log('DB Connection Established');
});

//Allow 'db' to be referenced from other scripts
exports.db = db;