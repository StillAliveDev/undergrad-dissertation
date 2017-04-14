var connection = require('./db.js');
var crypto = require('crypto');

//Make all functions available for other scripts
module.exports = {
    /**
     * Function to load all user information (WEB APP)
     * @param callback: data to return
     */
    loadFull: function(callback){
        var res = {
            users:[],
            total:0,
            totalAssigned:0,
            totalSignedIn:0,
            error:false,
            errorText:""
        };

        //Query for all user data (EXCEPT PASSWORD)
        var query1 = "select USER_ID, USER_NAME, USER_FIRST_NAME, USER_LAST_NAME, USER_CREATED_TIMESTAMP, USER_SIGNED_IN " +
            "FROM users;";
        //Total Users in database
        var query2 = "select count(users.user_id) as total from users";
        //Total users assigned to a fitment group
        var query3 = "select count(users.user_id) as total_assigned from users " +
            "join fitment_groups on fitment_groups.user_id = users.user_id;";
        //Total users signed in
        var query4 = "select count(users.user_id) as signed_in from users " +
            "where USER_SIGNED_IN = 'TRUE';";

        //Query 1
        connection.db.query(query1, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        res.users.push(rows[i]);
                    }
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        //Query 2
        connection.db.query(query2, function(err, rows, fields){
            if(!err){
                res.total = rows[0].total;
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        //Query 3
        connection.db.query(query3, function(err, rows, fields){
            if(!err){
                res.totalAssigned = rows[0].total_assigned;
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        //Query 4
        connection.db.query(query4, function(err, rows, fields){
            if(!err){
                res.totalSignedIn = rows[0].signed_in;
                callback(null, JSON.stringify(res)); //Return Data JSON
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
    },
    /**
     * Function to delete a user from the database (WEB APP) given a user id
     * @param data : user data and calling client username (For notifications)
     * @param callback
     */
    deleteUser : function(data, callback){
        var res = {
            eventUser: data.username,
            user_id: data.user_id,
            notifType: "D", //Delete
            error: false,
            errorText:""
        };

        //Delete Query
        var query = "DELETE FROM users where user_id ="+data.user_id+";";

        //Run Query
        connection.db.query(query, function(err, rows, fields){
            if(!err){
                console.log("User: " + data.user_id + " Deleted");
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        })
    },
    /**
     * Function to add a user to the database given a user's details
     * @param data: the user details and calling client username (For notifications)
     * @param callback
     */
    add : function(data, callback){
        var res = {
            eventUser : data.username,
            user:data.user,
            notifType:"A", //ADD
            error: false,
            errorText:""
        };

        //HASH Password 4 times using sha256
        var sha256_pass = crypto.createHash('sha256').update(res.user.password).digest("hex");
        sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");
        sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");
        sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");

        //Clear the original password from the transmitted data --  for when the user addition is broadcast to other clients
        res.user.password = "";

        //Add Query
        var query = "INSERT INTO USERS ( USER_NAME, USER_PASSWORD, USER_FIRST_NAME, USER_LAST_NAME, USER_CREATED_TIMESTAMP, " +
            "USER_SIGNED_IN) VALUES ('"+res.user.user_name+"', '"+sha256_pass+"', '"+res.user.user_first_name+"', '"+res.user.user_last_name+"', now(), 'FALSE');";

        //Run query
        connection.db.query(query, function(err, rows, fields){
            if(!err) {
                console.log("User: " + res.user_id + "Added");
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });
    }
};