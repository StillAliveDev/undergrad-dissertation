var connection = require('./db.js');

module.exports = {
    loadAllVins : function(callback){
        var res = [];
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
                    res.push({vehicles: vins})
                }
                else{
                    res.push({error: "Couldn't Load Vehicles"});
                    callback(JSON.stringify(res),null);
                }
            }
            else{
                res.push({error: "SQL Error"});
                callback(JSON.stringify(res),null);
            }

        });
        connection.db.query(query2, function(err,rows,fields){
           if(!err){
               if(rows.length > 0){
                   res.push({vin_count : rows[0].vin_count});
               }
           }
           else{
               res.push({error: "SQL Error"});
               callback(JSON.stringify(res),null);
           }
        });
        connection.db.query(query3, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.push({total_fitment_vins : rows[0].fitment_vin_count});
                    callback(null, JSON.stringify(res));
                }
            }
            else{
                res.push({error: "SQL Error"});
                callback(JSON.stringify(res),null);
            }
        });

    }
};