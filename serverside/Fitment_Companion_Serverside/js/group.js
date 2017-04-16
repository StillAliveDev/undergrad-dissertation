var connection = require('./db.js');

//Make all functions available to other scripts.
module.exports = {
    /**
     * Function to start a fitment group given the group id, Calls MySQL query to set a group as started
     *
     * @param data: group information and the calling client username (for notification)
     * @param callback: Callback function to send data back to 'server.js'
     */
    start: function(data, callback){
        //Response Data
        var res = {
            group_id : data.group_id,
            eventUser : data.user_name, // Calling client user name (Used in notifications)
            notifType: "S", // Sets the type of notification
            success: false,
            error: false,
            errorText: ""
        };

        //Query to update the fitment_group record identified by 'group_id'
        //Sets INCOMPLETE = TRUE and IN_PROGRESS = true.
        var query = "update fitment_groups "+
        "SET USER_ID= "+data.user_id+", INCOMPLETE = 'TRUE', IN_PROGRESS ='TRUE' WHERE FIT_GROUP_ID =" + data.group_id +";";

        //Run the query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                res.success = true;
                callback(null, JSON.stringify(res)); // Assemble the response data into JSON
            }
            else{
                //Set error variables in res to indicate an error.
                res.error = true;
                res.success = false;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); // Sends response data as JSON
            }
        });
    },
    /**
     * Function to finish a fitment group given a group_id
     *
     * @param data: group information and calling client user_name
     * @param callback: Callback to sent back to server.js
     */
    finish: function(data, callback){
        //Response data
        var res = {
            group_id : data.group_id,
            eventUser : data.user_name,
            notifType: "F",
            success: true,
            error: false,
            errorText:""
        };

        //Data is sent as a 1 or 0, database expects 'TRUE' or 'FALSE'
        var incomplete =  'FALSE';

        if(data.incomplete == 1)
            incomplete = 'TRUE';

        //Query to set a fitment group as completed, 'incomplete' can differ.
        //Adds notes to the record.
        var query= "update fitment_groups " +
            "SET USER_ID = NULL, IN_PROGRESS = 'FALSE', INCOMPLETE = '" + incomplete + "', ACT_COMP_TIMESTAMP = now()," +
            "GROUP_INCOMPLETE_NOTES = " + connection.db.escape(data.incomplete_notes) +" WHERE FIT_GROUP_ID =" + data.group_id +";";

        //Ren the query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                res.success = true;
                callback(null, JSON.stringify(res)); //Send as JSON
            }
            else{
                res.error = true;
                res.success = false;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); //Send as JSON
            }
        });

    },
    /**
     * Function used by the web app to load all fitment information and relevant count statistics
     * @param callback: data to send to the client
     */
    loadFull : function(callback){
        var res = {
            fitments: [],
            totalGroups:0, //Groups in database
            totalAssigned:0, //Groups assigned to a user (in progress)
            totalcompleted:0, //Groups completed
            pending:0, // Groups waiting to start
            error:false,
            errorText:""
        };

        //Query to load all fitment information in the database with the number of parts assigned and user assigned to each
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

        //Query to return fitment counts for totalGroups, totalAssigned, totalCompleted and pending
        var count_query = "SELECT "+
        "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups) as 'totalGroups', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where USER_ID IS NOT null) as 'totalAssigned', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'FALSE') as 'totalCompleted', " +
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'TRUE') as 'pending';";

        //Run first query
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
                callback(JSON.stringify(res),null); //Send as JSON (if SQL error)
            }
        });

        //Run Second query
        connection.db.query(count_query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    //Assemble data
                    res.totalGroups = rows[0].totalGroups;
                    res.totalAssigned = rows[0].totalAssigned;
                    res.totalCompleted = rows[0].totalCompleted;
                    res.pending = rows[0].pending;
                    callback(null, JSON.stringify(res)); //Send as JSON
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null); //Send as JSON (if SQL Error)
            }
        });
    },
    /**
     * Function to delete a fitment group given a group_id
     * @param data: group_id and calling client user (as notification)
     * @param callback : data to return
     */
    delete : function(data, callback){
        //Response data
        var res = {
            eventUser: data.username, // Calling client user_name (notifiaction)
            fitment: data.fitment,
            notifType: "D", // Notification type
            error:false,
            errorText:""
        };

        //Query to delete the fitment_operations first
        var query1 = "DELETE FROM fitment_operations where fitment_operations.GROUP_ID = "+res.fitment+";";
        //Delete the fitment_group
        var query2 = "DELETE FROM fitment_groups where fitment_groups.FIT_GROUP_ID = "+res.fitment+";";

        //Run query1
        connection.db.query(query1, function(err,rows,fields){
            if(err){ // Response would either error or not. No need to transmit success for this one
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); //send JSON (if SQL error)
            }
        });
        //Run query2
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); //Send JSON
            }
        });
    },
    /**
     * Function to load all parts and fitments not currently on a fitment_group or operation
     * @param callback : data to return
     */
    partsVinsNotInFitment:function(callback){
        //Response data
        var res = {
            parts: [],
            vehicles: [],
            error:false,
            errorText:""
        };

        //Loads all parts not on a fitment_operation
        var partsQuery = "select parts.PART_ID, parts.name, parts.MANUFACTURER from parts "+
        "where parts.part_id not in (select distinct fitment_operations.part_id from fitment_operations) "+
        "and parts.IN_INVENTORY = 'TRUE';";

        //Loads all vehicles not on an operation
        var vehiclesQuery = "select * from vehicles "+
        "where vehicles.vin not in (select fitment_groups.VEH_VIN from fitment_groups);";

        //Run first query
        connection.db.query(partsQuery, function(err, rows, fields){
            if(!err){
                if(rows.length >0){
                    for(var i = 0; i < rows.length;i++){
                        res.parts.push(rows[i]); //Assemble data
                    }
                }
                else{
                    res.error = true;
                    res.errorText = "No parts available";
                    callback(JSON.stringify(res),null); //Send JSON (if Data Error)
                }
            }
            else{
                console.log(err);
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res), null); //Send JSON (if SQL Error)
            }

        });
        //Run second query
        connection.db.query(vehiclesQuery, function(err, rows, fields){
            if(!err){
                if(rows.length >0){
                    for(var i = 0; i< rows.length;i++){
                        res.vehicles.push(rows[i]); //Assemble data
                    }
                    callback(null, JSON.stringify(res)); //Send JSON
                }
                else{
                    res.error = true;
                    res.errorText = "No Vehicles Available";
                    callback(JSON.stringify(res), null); //Send JSON (if data error)
                }
            }
            else{
                console.log(err);
                res.error = true;
                res.errorText = true;
                callback(JSON.stringify(res),null); //Send JSON (if SQL Error)
            }
        })

    }
};