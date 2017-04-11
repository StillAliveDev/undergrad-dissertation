var connection = require('./db.js');

module.exports = {
    loadFull: function(callback){
        var res = {
            users:[],
            total:0,
            totalAssigned:0,
            totalSignedIn:0,
            error:false,
            errorText:""
        };

        var query1 = "select USER_ID, USER_NAME, USER_FIRST_NAME, USER_LAST_NAME, USER_CREATED_TIMESTAMP, USER_SIGNED_IN " +
            "FROM users;";
        var query2 = "select count(users.user_id) as total from users";
        var query3 = "select count(users.user_id) as total_assigned from users " +
            "join fitment_groups on fitment_groups.user_id = users.user_id;";
        var query4 = "select count(users.user_id) as signed_in from users " +
            "where USER_SIGNED_IN = 'TRUE';";

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
        connection.db.query(query4, function(err, rows, fields){
            if(!err){
                res.totalSignedIn = rows[0].signed_in;
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
    },
    deleteUser : function(data, callback){
        var res = {
            username: data.username,
            user_id: data.user_id,
            notifType: "D",
            error: false,
            errorText:""
        };

        var query = "DELETE FROM users where user_id ="+data.user_id+";";

        connection.db.query(query, function(err, rows, fields){
            if(!err){
                console.log("User: " + data.user_id + " Deleted")
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        })
    }
};