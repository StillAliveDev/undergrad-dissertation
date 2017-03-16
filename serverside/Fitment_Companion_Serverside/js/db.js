var mysql = require('mysql');

var db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : 'password',
    database    : 'fitment_app'
});

db.connect(function(err){
   if(err){
       console.log('Error Connection to Database');
       return;
   }
   console.log('DB Connection Established');
});

exports.db = db;