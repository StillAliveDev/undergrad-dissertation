var connection = require('./db.js');

module.exports = {
    loadHomeData : function(callback){
        var res = {
            totalVehicles: 0,
            totalAssignedVeh: 0,
            totalParts: 0,
            totalAssignedParts:0,
            error: false,
            errorText: null
        };
        ;

        var vehicleCountQuery = "SELECT count(vehicles.vin) as vin_count FROM vehicles;";
        var vehicleAssigedQuery = "SELECT count(vehicles.vin) as a_vin_count " +
            "FROM vehicles " +
            "WHERE vehicles.vin IN (SELECT DISTINCT fitment_groups.veh_vin FROM fitment_groups);";
        var partsCountQuery = "SELECT count(parts.part_id) as part_count FROM parts;";
        var partsAssignedQuery = "SELECT count(parts.part_id) as a_part_count " +
            "FROM parts " +
            "WHERE parts.part_id IN (SELECT DISTINCT fitment_operations.part_id FROM fitment_operations);";

        connection.db.query(vehicleCountQuery, function(err, rows, fields){
            if(!err){
                if(rows.length > 0){
                    res.totalVehicles = rows[0].vin_count;
                }
            }
            else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        connection.db.query(vehicleAssigedQuery, function(err,rows,fields){
           if(!err){
               if(rows.length > 0){
                   res.totalAssignedVeh = rows[0].a_vin_count;
               }
           }
           else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
           }
        });
        connection.db.query(partsCountQuery, function(err,rows,fields){
           if(!err){
                if(rows.length > 0){
                    res.totalParts = rows[0].part_count;
                }
           }
           else{
                res.error = true;
                res.errorTesxt = err;
                console.log(err);
                callback(JSON.stringify(res),null);
           }
        });
        connection.db.query(partsAssignedQuery, function(err,rows,fields){
           if(!err){
                if(rows.length >0) {
                    res.totalAssignedParts = rows[0].a_part_count;
                }
                callback(null, JSON.stringify(res));
           }
           else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
           }
        });
    }
}