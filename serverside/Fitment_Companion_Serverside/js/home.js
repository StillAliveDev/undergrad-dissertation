var connection = require('./db.js');

//Make all function available to other scripts.
module.exports = {
    /**
     * Function to load all statistc data (MOBILE APP)
     * @param callback: data to return
     */
    loadHomeData : function(callback){
        var res = {
            totalVehicles: 0, //Vehicles in database
            totalAssignedVeh: 0, //Assgined vehicles in database
            totalParts: 0, //Parts in database
            totalAssignedParts:0, //Assigned parts in database
            totalPartsInInventory:0, //Parts in inventory
            totalGroups:0, //Groups in database
            totalGroupsInProgress:0, //Groups in progress
            totalGroupsPending:0, //Groups pending
            totalGroupsCompleted:0, //Groups completed
            error: false,
            errorText: null
        };


        //Query to load all statistic data for the above variables
        var query = "SELECT "+
        "(select count(vehicles.vin) from vehicles) as 'vin_count', "+
            "(select count(vehicles.vin) from vehicles where vehicles.vin in (select distinct fitment_groups.VEH_VIN from fitment_groups)) as 'a_vin_count', "+
            "(select count(parts.PART_ID)from parts) as 'part_count', "+
            "(select count(parts.part_id)_ from parts where parts.part_id in (select distinct fitment_operations.PART_ID from fitment_operations)) as 'a_part_count', "+
            "(select count(parts.part_id) from parts where parts.IN_INVENTORY = 'TRUE') as 'parts_in_inv', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups) as 'totalGroups', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'TRUE' and INCOMPLETE = 'TRUE') as 'totalGroupsInProgress', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'TRUE') as 'totalGroupsPending', "+
            "(select count(fitment_groups.FIT_GROUP_ID) from fitment_groups where IN_PROGRESS = 'FALSE' and INCOMPLETE = 'FALSE') as 'totalGroupsComplete';";

        //Run the query
        connection.db.query(query, function(err, rows, fields){
            if(!err){
                if(rows.length > 0){ //Assemble the data
                    res.totalVehicles = rows[0].vin_count;
                    res.totalAssignedVeh = rows[0].a_vin_count;
                    res.totalParts = rows[0].part_count;
                    res.totalAssignedParts = rows[0].a_part_count;
                    res.totalPartsInInventory = rows[0].parts_in_inv;
                    res.totalGroups = rows[0].totalGroups;
                    res.totalGroupsInProgress = rows[0].totalGroupsInProgress;
                    res.totalGroupsPending = rows[0].totalGroupsPending;
                    res.totalGroupsComplete = rows[0].totalGroupsComplete;
                }
                callback(null, JSON.stringify(res)); //Send JSON
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
     * Function to load home screen statistics (MOBILE APP)
     * @param callback: data to return
     */
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

        //Query to load all the above variables from the database
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

        //Run query
        connection.db.query(query, function(err, rows, fields) {
            if (!err) {
                if (rows.length > 0) {
                    res = { //Assemble data
                        users: {
                            totalUsers: rows[0].totalUsers,
                            totalUsersSignedIn: rows[0].totalUsersSignedIn,
                            totalAssignedUsers: rows[0].totalAssignedUsers
                        },
                        parts: {
                            totalParts: rows[0].totalParts,
                            totalPartsInInventory: rows[0].totalPartsInInv,
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

                    callback(null, JSON.stringify(res));// Send JSON
                }
            }
            else {
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res), null); //Send JSON (if SQL error)
            }
        });

    }
};