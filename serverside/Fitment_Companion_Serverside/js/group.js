var connection = require('./db.js');

module.exports = {
    start: function(data, callback){
        var res = {
            group_id : data.group_id,
            user : data.user_name,
            success: false,
            error: false,
            errorText: ""
        };

        var query = "update fitment_groups "+
        "SET USER_ID= "+data.user_id+", IN_PROGRESS ='TRUE' WHERE FIT_GROUP_ID =" + data.group_id +";";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                res.success = true;
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.success = false;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });
    },
    finish: function(data, callback){
        var res = {
            group_id : data.group_id,
            user : data.user_name,
            success: true,
            error: false,
            errorText:""
        };

        var incomplete =  'FALSE';

        if(data.incomplete == 1)
            incomplete = 'TRUE';

        var query= "update fitment_groups " +
            "SET USER_ID = NULL, IN_PROGRESS = 'FALSE', INCOMPLETE = '" + incomplete + "', " +
            "GROUP_INCOMPLETE_NOTES = '" + data.incomplete_notes +"' WHERE FIT_GROUP_ID =" + data.group_id +";";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                res.success = true;
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.success = false;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });

    }
};