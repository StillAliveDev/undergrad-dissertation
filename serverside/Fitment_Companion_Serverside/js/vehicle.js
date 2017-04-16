var connection = require('./db.js');

//Make all functions available to other scripts.
module.exports = {
    /**
     * Function to load all VIN numbers for all vehicles in the Database (MOBILE APP)
     * @param callback : data to return
     */
    loadAllVins : function(callback){
        var res = {
            vehicles: [],
            total: 0,
            in_fitments:0,
            error: false,
            errorText: ""
        };
        var vins = [];
        var vin_count = [];
        //All vehicle vin numbers
        var query = "SELECT vehicles.vin FROM vehicles;";
        // NUmber of vehicles in the database
        var query2 = "select count(vehicles.vin) as vin_count FROM vehicles;";
        //Number of vehicles currently assigned
        var query3 = "select count(vehicles.vin) as fitment_vin_count from vehicles " +
                    "where vehicles.vin in (select distinct fitment_groups.VEH_VIN from fitment_groups);";

        //Query1
        connection.db.query(query, function(err,rows,fields) {
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        vins.push(rows[i].vin);
                    }
                    res.vehicles = vins;
                }
                else{
                    res.error = true;
                    res.errorText = "No Vehicles Found";
                    callback(JSON.stringify(res),null);
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res),null);
            }

        });
        //Query 2
        connection.db.query(query2, function(err,rows,fields){
           if(!err){
               if(rows.length > 0){
                   res.total = rows[0].vin_count;
               }
           }
           else{
               res.error = true;
               res.errorText = err;
               callback(JSON.stringify(res),null);
           }
        });
        //Query 3
        connection.db.query(query3, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.in_fitments = rows[0].fitment_vin_count;
                    callback(null, JSON.stringify(res));
                }
                else{
                    res.error = true;
                    res.errorText = "No fitments found";
                    callback(JSON.stringify(res),null); //Return data JSON
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res),null);
            }
        });

    },
    /**
     * Function to reurn a vehicle's full information, including fitment_groups, operations and parts given a VIN Number
     * (MOBILE APP)
     * @param vin : vehicle to enquire
     * @param callback : data to return
     */
    enquire : function(vin,callback){
        var res = {
            vehicle:{},
            fitmentGroups:[],
            fitmentOperations:[],
            assignedParts: [],
            error: false,
            errorText: ""
        };
        //All Vehicle information
        var vehQuery = "SELECT * FROM vehicles WHERE vehicles.vin = "+connection.db.escape(vin)+";";
        //All assigned fitment groups
        var fitmentGroupQuery = "SELECT * from fitment_groups WHERE fitment_groups.veh_vin = "+connection.db.escape(vin)+";";
        //All fitment_group operations
        var fitmentOpQuery = "SELECT * from fitment_operations " +
                            "WHERE fitment_operations.group_id = (SELECT fitment_groups.fit_group_id " +
                                "FROM fitment_groups " +
                                "WHERE fitment_groups.veh_vin = "+connection.db.escape(vin)+");";
        //All operation's parts
        var assignPartsQuery = "SELECT parts.PART_ID, parts.NAME, parts.IN_INVENTORY FROM parts " +
        "join fitment_operations on fitment_operations.PART_ID = parts.part_id " +
        "where fitment_operations.GROUP_ID = (" +
        "select fitment_groups.FIT_GROUP_ID " +
        "from fitment_groups " +
        "where fitment_groups.veh_vin = " + connection.db.escape(vin) + ");";

        //Query 1
        connection.db.query(vehQuery, function(err,rows,fields){
            if(!err) {
                if(rows.length > 0) {
                    res.vehicle = rows[0];
                }
                else{
                    res.error = true;
                    res.errorText = "No Vehicle Found";
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
        connection.db.query(fitmentGroupQuery, function(err,rows,fields){
            if(!err){
                if(rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        res.fitmentGroups.push(rows[i]);
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

        //Query 3
        connection.db.query(fitmentOpQuery, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++) {
                        res.fitmentOperations.push(rows[i]);
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

        //Query 4
        connection.db.query(assignPartsQuery, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length ; i++){
                        res.assignedParts.push(rows[i])
                    }
                }
                callback(null, JSON.stringify(res)); //Return data JSON
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null)
            }
        });

    },
    /**
     * Function to load all vehicles information for every vehicle (Web App)
     * @param callback : data to return
     */
    loadAll: function(callback){
        var res={
            vehicles:[],
            total: 0,
            totalAssigned: 0,
            error:false,
            errorText:""
        };

        //All vehicles' information
        var query1 = "SELECT * FROM vehicles;";
        //Number of vehicles in the database
        var query2 = "SELECT count(vehicles.vin) as TOTAL FROM vehicles;";
        //Number of assigned Vehicles
        var query3 = "select count(vehicles.vin) as fitment_vin_count from vehicles " +
            "where vehicles.vin in (select distinct fitment_groups.VEH_VIN from fitment_groups);";

        //Query 1
        connection.db.query(query1, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        res.vehicles.push(rows[i]);
                    }
                }
                else{
                    res.error = true;
                    res.errorText = err;
                    console.log(err);
                    callback(JSON.stringify(res),null);
                }
            }
        });
        //Query2
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.total = rows[0].TOTAL;
                }
                else{
                    res.error = true;
                    res.errorText = err;
                    console.log(err);
                    callback(JSON.stringify(res),null);
                }
            }
        });
        //Query 3
        connection.db.query(query3, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.totalAssigned = rows[0].fitment_vin_count;
                    callback(null, JSON.stringify(res)); //Send Data JSON
                }
                else{
                    res.error = true;
                    res.errorText = err;
                    console.log(err);
                    callback(JSON.stringify(res),null);
                }
            }
        });
    },
    /**
     * Function to add a vehicle to the database given the vehicle information (WEB APP)
     * @param data: the vehicle data and the calling client username (form notifications)
     * @param callback : data to return
     */
    add: function(data, callback){
        var res = {
            eventUser: data.username,
            vin: data.vehicle.vin,
            notifType: "A", //ADD
            error: false,
            errorText: ""
        };

        //Insert the vehicle into the db
        var query = "insert into vehicles (VIN, MAKE, MODEL, COLOUR, ADDED_TIMESTAMP) " +
            "VALUES (" + connection.db.escape(data.vehicle.vin) + "," +  connection.db.escape(data.vehicle.make) + "," + connection.db.escape(data.vehicle.model) + "," +
                    connection.db.escape(data.vehicle.colour) + ", now())";

        //Run query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log("Vehicle: " + data.vehicle.vin + " Added");
                callback(null, JSON.stringify(res)); //Return data JSON
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
     * Function to delete a vehicle from the database given a vin number (WEB APP)
     * @param data : vin to delete and the calling client username (form notifications)
     * @param callback
     */
    delete: function(data, callback){
        var res = {
            eventUser: data.username,
            vin: data.vin,
            notifType: "D", //DELETE
            error: false,
            errorText: ""
        };

        //Delete Query
        var query = "delete from vehicles where vin = "+connection.db.escape(data.vin)+";";

        //Run Query
        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log("Vehicle: " + data.vin + " Deleted");
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