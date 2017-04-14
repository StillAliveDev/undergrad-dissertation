var connection = require('./db.js');

//Make all functions available to other scripts
module.exports = {
    /**
     * Function to return a list of all parts in the database (MOBILE APP)
     * @param callback : data to return
     */
    loadAllParts : function(callback){
        var res = {
            parts: [],
            total:0,
            error:false,
            errorText:""
        };
        //List of parts
        var query = "SELECT parts.PART_ID, parts.NAME, parts.MANUFACTURER " +
            "FROM parts;";
        //Number of parts
        var query2 = "select count(parts.part_id) as PARTS_COUNT from parts;";

        //Run query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        res.parts.push(rows[i]);
                    }
                }
                else{
                    res.error = true;
                    res.errorText = "No Parts Found";
                    callback(JSON.stringify(res),null); //Send JSON (if data error)
                }
            }
            else{
                res.error = true;
                res.errorText = err
                console.log(err);
                callback(JSON.stringify(res),null); //Send JSON (if SQL error)
            }
        });
        //Run query2
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.total = rows[0].PARTS_COUNT;
                }
                callback(null, JSON.stringify(res)); //Send JSON (result)
            }
            else{
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res),null); //Send JSON (if sql error)
            }
        });
    },
    /**
     * Function to allow a user to enquire on a given part id, returns all information about that part
     * @param id: id to enquire
     * @param callback: data to return
     */
    enquire: function(id, callback){
        var res = {
            part: {},
            error: false,
            errorText: ""
        };
        //Find all data for he given part
        var query = "SELECT * FROM parts WHERE PART_ID = '" +id+ "';";

        //Run the query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.part = rows[0];
                }
                else{
                    res.error = true;
                    res.errorText = "Part not Found";
                    callback(JSON.stringify(res), null); //Send JSON (if data error)
                }
                callback(null, JSON.stringify(res));//Send JSON (result)
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null); //Send JSON (if SQL error)
            }

        });
    },
    /**
     * Function to allow a user to remove a part from inventory
     * @param data: part to remove, calling clent user name
     * @param callback : data to return, inc notification
     */
    removePart: function(data,callback){
        var res = {
            eventUser:data.username,
            part_id:data.part_id,
            notifType:"R", //Notification 'R' = remove
            error:false,
            errorText: ""
        };

        //Sets the part as out of inventory
        var query = "UPDATE parts " +
            "SET IN_INVENTORY = 'FALSE' " +
            "WHERE PART_ID = " + data.part_id + ";";

        //Run the query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log('part: ' + data.part_id + ' removed from inventory');
                res.error = false;
                callback(null, JSON.stringify(res)); //Send JSON (result)
            }
            else {
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null); //Send JSON (if SQL error)
            }
        });
    },
    /**
     * Function to allow a user to return a part to inventory given a part id
     * @param data: part and calling client username
     * @param callback: data to return to clients
     */
    returnPart : function(data, callback){
        var res = {
            eventUser: data.username,
            part_id: data.part_id,
            notifType: "Ret", //'Ret' = Return part
            error:false,
            errorText: ""
        };

        //Set the part as in inventory
        var query = "UPDATE parts " +
            "SET IN_INVENTORY = 'TRUE' " +
            "WHERE PART_ID = " + data.part_id + ";";

        //Run the query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log('part: ' + data.part_id + 'removed from inventory');
                res.error = false;
                callback(null, JSON.stringify(res)); //Send JSON (result)
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); // Send JSON (if SQL Error)
            }
        });
    },
    /**
     * Function to load all parts data (WEB APP)
     * @param callback: data to return
     */
    loadFull: function(callback){
        var res = {
            parts:[],
            total:0,
            totalAssigned:0,
            totalInInventory:0,
            error:false,
            errorText:""
        };

        //Query for all parts in the database.
        var query = "SELECT * FROM parts;";
        //Query for the number of parts in the database
        var query2 = "SELECT count(part_id) as total from parts;";
        //Query for number of assigned parts
        var query3 = "SELECT DISTINCT count(parts.part_id) as totalAssigned FROM parts " +
            "JOIN fitment_operations on parts.part_id = fitment_operations.part_id;";
        //Query for all parts currently in inventory
        var query4 = "SELECT count(parts.part_id) as totalInInventory FROM parts where IN_INVENTORY = 'TRUE';";

        //Run query1
        connection.db.query(query, function(err, rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        res.parts.push(rows[i]);
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
        //Run query 2
        connection.db.query(query2, function(err, rows, fields){
            if(!err){
                if(rows.length > 0){
                    res.total = rows[0].total
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        //Run query 3
        connection.db.query(query3, function(err, rows, fields){
            if(!err){
                if(rows.length >0){
                    res.totalAssigned = rows[0].totalAssigned;
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        //RUn query 4
        connection.db.query(query4, function(err, rows, fields){
            if(!err){
                if(rows.length > 0){
                    res.totalInInventory = rows[0].totalInInventory;
                    callback(null, JSON.stringify(res), null); //Return all data JSON
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
    /**
     * Function to add a part to the database given the part information
     * @param data : part information adn calling client username (for notifications)
     * @param callback  data to return
     */
    addPart : function(data, callback){
        var res = {
            eventUser: data.username,
            part_name: data.part.name,
            notifType: "A",
            error:false,
            errorText:""
        };

        //Adds he part to the database with the given infotmation
        var query = "insert into parts (NAME, MANUFACTURER, WIDTH_M, LENGTH_M, WEIGHT, IN_INVENTORY, ADDED_TIMESTAMP) " +
            "VALUES ('"+data.part.name+"','"+data.part.manufacturer+"',"+data.part.width+","+data.part.length+","+data.part.weight+", 'TRUE', now());";

        //Run query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log("Part: " + data.part.part_name + " Added");
                res.error = false;
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
     * Function to delete a part from the database, given a part id
     * @param data: he part id and calling client username (notifications)
     * @param callback
     */
    deletePart : function(data, callback){
        var res = {
            eventUser: data.username,
            part_id: data.part_id,
            notifType: "D",
            error: false,
            errorText : ""
        };

        //Delete the part given the part_id
        var query = "DELETE from parts WHERE PART_ID = "+data.part_id+";";

        //Run query
        connection.db.query(query, function(err, rows, fields){
            if(!err){
                console.log("Part: " + data.part_id + " Deleted");
                res.error = false;
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        })
    }
};