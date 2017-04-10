var connection = require('./db.js');

module.exports = {
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
        var query = "SELECT vehicles.vin FROM vehicles;";
        var query2 = "select count(vehicles.vin) as vin_count FROM vehicles;";
        var query3 = "select count(vehicles.vin) as fitment_vin_count from vehicles " +
                    "where vehicles.vin in (select distinct fitment_groups.VEH_VIN from fitment_groups);";
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
        connection.db.query(query3, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.in_fitments = rows[0].fitment_vin_count;
                    callback(null, JSON.stringify(res));
                }
                else{
                    res.error = true;
                    res.errorText = "No fitments found";
                    callback(JSON.stringify(res),null);
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                callback(JSON.stringify(res),null);
            }
        });

    },
    enquire : function(vin,callback){
        var res = {
            vehicle:{},
            fitmentGroups:[],
            fitmentOperations:[],
            assignedParts: [],
            error: false,
            errorText: ""
        };
        var vehQuery = "SELECT * FROM vehicles WHERE vehicles.vin = '"+vin+"';";
        var fitmentGroupQuery = "SELECT * from fitment_groups WHERE fitment_groups.veh_vin = '"+vin+"';";
        var fitmentOpQuery = "SELECT * from fitment_operations " +
                            "WHERE fitment_operations.group_id = (SELECT fitment_groups.fit_group_id " +
                                "FROM fitment_groups " +
                                "WHERE fitment_groups.veh_vin = '"+vin+"');";
        var assignPartsQuery = "SELECT parts.PART_ID, parts.NAME, parts.IN_INVENTORY FROM parts " +
        "join fitment_operations on fitment_operations.PART_ID = parts.part_id " +
        "where fitment_operations.GROUP_ID = (" +
        "select fitment_groups.FIT_GROUP_ID " +
        "from fitment_groups " +
        "where fitment_groups.veh_vin = '" + vin + "');";

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

        connection.db.query(assignPartsQuery, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length ; i++){
                        res.assignedParts.push(rows[i])
                    }
                }
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null)
            }
        });

    },
    loadAll: function(callback){
        var res={
            vehicles:[],
            total: 0,
            totalAssigned: 0,
            error:false,
            errorText:""
        };

        var query1 = "SELECT * FROM vehicles;";
        var query2 = "SELECT count(vehicles.vin) as TOTAL FROM vehicles;";
        var query3 = "select count(vehicles.vin) as fitment_vin_count from vehicles " +
            "where vehicles.vin in (select distinct fitment_groups.VEH_VIN from fitment_groups);";

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

        connection.db.query(query3, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.totalAssigned = rows[0].fitment_vin_count;
                    callback(null, JSON.stringify(res));
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
    add: function(data, callback){
        var res = {
            username: data.username,
            vin: data.vehicle.vin,
            notifTyoe: "A",
            error: false,
            errorText: ""
        };

        var query = "insert into vehicles (VIN, MAKE, MODEL, COLOUR, ADDED_TIMESTAMP) " +
            "VALUES (" + data.vehicle.vin + "," +  data.vehicle.make + "," + data.vehicle.model + "," +
                    data.vehicle.colour + ", now())";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log("Vehicle: " + data.vehicle.vin + " Added")
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
    delete: function(data, callback){
        var res = {
            username: data.username,
            vin: data.vin,
            notifType: "D",
            error: false,
            errorText: ""
        }

        var query = "delete from vehicles where vin = '"+data.vin+"';";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log("Vehicle: " + data.vin + " Deleted")
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