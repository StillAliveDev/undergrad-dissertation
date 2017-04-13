var connection = require('./db.js');

module.exports = {
    start: function(data, callback){
        var res = {
            group_id : data.group_id,
            eventUser : data.user_name,
            notifType: "S",
            success: false,
            error: false,
            errorText: ""
        };

        var query = "update fitment_groups "+
        "SET USER_ID= "+data.user_id+", INCOMPLETE = 'TRUE', IN_PROGRESS ='TRUE' WHERE FIT_GROUP_ID =" + data.group_id +";";

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
            eventUser : data.user_name,
            notifType: "F",
            success: true,
            error: false,
            errorText:""
        };

        var incomplete =  'FALSE';

        if(data.incomplete == 1)
            incomplete = 'TRUE';

        var query= "update fitment_groups " +
            "SET USER_ID = NULL, IN_PROGRESS = 'FALSE', INCOMPLETE = '" + incomplete + "', ACT_COMP_TIMESTAMP = now()," +
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

    },
    loadFull : function(callback){
        var res = {
            fitments: [],
            totalGroups:0,
            totalAssigned:0,
            totalcompleted:0,
            pending:0,
            error:false,
            errorText:""
        };

        var query = "select " +
        "fitment_groups.FIT_GROUP_ID, "+
            "fitment_groups.DESCRIPTION, "+
            "fitment_groups.VEH_VIN, "+
            "fitment_groups.CREATED_TIMESTAMP, "+
            "fitment_groups.EST_COMP_TIMESTAMP, "+
            "fitment_groups.ACT_COMP_TIMESTAMP, "+
            "fitment_groups.IN_PROGRESS, "+
            "fitment_groups.INCOMPLETE, "+
            "fitment_groups.GROUP_INCOMPLETE_NOTES, "+
            "(select users.USER_NAME from users " +
                    "where users.USER_ID = fitment_groups.USER_ID) as 'assignedUser', "+
            "(select count(fitment_operations.FIT_OP_ID) " +
                    "from fitment_operations " +
                    "where fitment_operations.GROUP_ID = fitment_groups.FIT_GROUP_ID) as 'assignedParts' "+
        "from fitment_groups;";

        var count_query = "SELECT "+
        "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups) as 'totalGroups', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where USER_ID IS NOT null) as 'totalAssigned', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'FALSE') as 'totalCompleted', " +
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'TRUE') as 'pending';";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        res.fitments.push(rows[i]);
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

        connection.db.query(count_query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.totalGroups = rows[0].totalGroups;
                    res.totalAssigned = rows[0].totalAssigned;
                    res.totalCompleted = rows[0].totalCompleted;
                    res.pending = rows[0].pending;
                    callback(null, JSON.stringify(res));
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
    },
    delete : function(data, callback){
        var res = {
            eventUser: data.username,
            fitment: data.fitment,
            notifType: "D",
            error:false,
            errorText:""
        };

        var query1 = "DELETE FROM fitment_operations where fitment_operations.GROUP_ID = "+res.fitment+";";
        var query2 = "DELETE FROM fitment_groups where fitment_groups.FIT_GROUP_ID = "+res.fitment+";";

        connection.db.query(query1, function(err,rows,fields){
            if(err){
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });
    },
    partsVinsNotInFitment:function(callback){
        var res = {
            parts: [],
            vehicles: [],
            error:false,
            errorText:""
        };

        var partsQuery = "select parts.PART_ID, parts.name, parts.MANUFACTURER from parts "+
        "where parts.part_id not in (select distinct fitment_operations.part_id from fitment_operations) "+
        "and parts.IN_INVENTORY = 'TRUE';";

        var vehiclesQuery = "select * from vehicles "+
        "where vehicles.vin not in (select fitment_groups.VEH_VIN from fitment_groups);";

        connection.db.query(partsQuery, function(err, rows, fields){
            if(!err){
                if(rows.length >0){
                    for(var i = 0; i < rows.length;i++){
                        res.parts.push(rows[i]);
                    }
                }
                else{
                    res.error = true;
                    res.errorText = "No parts available";
                    callback(JSON.stringify(res),null);
                }
            }
            else{
                console.log(err);
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res), null);
            }

        });
        connection.db.query(vehiclesQuery, function(err, rows, fields){
            if(!err){
                if(rows.length >0){
                    for(var i = 0; i< rows.length;i++){
                        res.vehicles.push(rows[i]);
                    }
                    callback(null, JSON.stringify(res));
                }
                else{
                    res.error = true;
                    res.errorText = "No Vehicles Available";
                    callback(JSON.stringify(res), null);
                }
            }
            else{
                console.log(err);
                res.error = true;
                res.errorText = true;
                callback(JSON.stringify(res),null);
            }
        })

    }
};