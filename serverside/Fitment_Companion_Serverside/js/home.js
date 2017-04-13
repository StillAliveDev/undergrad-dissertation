var connection = require('./db.js');

module.exports = {
    loadHomeData : function(callback){
        var res = {
            totalVehicles: 0,
            totalAssignedVeh: 0,
            totalParts: 0,
            totalAssignedParts:0,
            totalPartsInInventory:0,
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
        var partsInInventoryQuery = "SELECT count(part_id) as parts_in_inv FROM parts where IN_INVENTORY = 'TRUE';"

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
           }
           else{
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
           }
        });
        connection.db.query(partsInInventoryQuery, function(err, rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.totalPartsInInventory = rows[0].parts_in_inv;
                }
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
    homeLoadDataWeb : function(callback){
        var res = {
            users:{
                totalUsers:0,
                totalUsersSignedIn:0,
                totalAssignedUsers:0
            },
            parts:{
                totalParts:0,
                totalPartsInInventory:0,
                totalAssignedParts:0
            },
            vehicles:{
                totalVehicles:0,
                totalAssignedVehicles:0
            },
            fitments:{
                totalGroups:0,
                totalGroupsPending:0,
                totalGroupsInProgress:0,
                totalGroupsCompleted:0
            },
            error:false,
            errorText:""
        };

        var query = "SELECT "+
        "(select count(users.user_id) from users) as 'totalUsers', "+
            "(select count(users.user_id) from users where users.USER_SIGNED_IN = 'TRUE') as 'totalUsersSignedIn', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where fitment_groups.USER_ID IS NOT NULL) as 'totalAssignedUsers', "+

            "(select count(parts.part_id) from parts) as 'totalParts', "+
            "(select count(parts.part_id) from parts where parts.IN_INVENTORY = 'TRUE') as 'totalPartsInInv', "+
            "(select count(fitment_operations.FIT_OP_ID) from fitment_operations where fitment_operations.PART_ID IS NOT NULL) as 'totalAssignedParts', "+

            "(select count(vehicles.vin) from vehicles) as 'totalVehicles', "+
            "(select count(vehicles.vin) from vehicles where vehicles.vin in (select fitment_groups.VEH_VIN from fitment_groups))as 'totalAssignedVehicles', "+

            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups) as 'totalGroups', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'TRUE' and INCOMPLETE = 'TRUE') as 'totalGroupsInProgress', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'TRUE') as 'totalGroupsPending', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'FALSE') as 'totalGroupsCompleted';";

        connection.db.query(query, function(err, rows, fields) {
            if (!err) {
                if (rows.length > 0) {
                    res = {
                        users: {
                            totalUsers: rows[0].totalUsers,
                            totalUsersSignedIn: rows[0].totalUsersSignedIn,
                            totalAssignedUsers: rows[0].totalAssignedUsers
                        },
                        parts: {
                            totalParts: rows[0].totalParts,
                            totalPartsInInventory: rows[0].totalPartsInInventory,
                            totalAssignedParts: rows[0].totalAssignedParts
                        },
                        vehicles: {
                            totalVehicles: rows[0].totalVehicles,
                            totalAssignedVehicles: rows[0].totalAssignedVehicles
                        },
                        fitments: {
                            totalGroups: rows[0].totalGroups,
                            totalGroupsPending: rows[0].totalGroupsPending,
                            totalGroupsInProgress: rows[0].totalGroupsInProgress,
                            totalGroupsCompleted: rows[0].totalGroupsCompleted
                        },
                        error: false,
                        errorText: ""
                    };

                    callback(null, JSON.stringify(res));
                }
            }
            else {
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null);
            }
        });

    }
};