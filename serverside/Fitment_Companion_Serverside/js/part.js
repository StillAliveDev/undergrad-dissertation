var connection = require('./db.js');

module.exports = {
    loadAllParts : function(callback){
        var res = [];
        var parts = [];
        var query = "SELECT parts.part_id, parts.name " +
            "FROM parts;";
        var query2 = "select count(parts.part_id) as parts_count from parts;";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    for(var i = 0; i < rows.length; i++){
                        parts.push({part_id: rows[i].part_id, part_name: rows[i].name});
                    }
                    res.push({parts: parts});
                }
            }
            else{
                res.push({error: 'SQL Error'});
                callback(JSON.stringify(res),null);
            }
        });
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.push({parts_count : rows[0].parts_count})
                }
                callback(null, JSON.stringify(res));
            }
            else{
                res.push({error: 'SQL Error'});
                callback(JSON.stringify(res),null);
            }
        });
    },
    enquire: function(id, callback){
        var res = {
            part: {},
            error: false,
            errorText: ""
        };
        var query = "SELECT * FROM parts WHERE PART_ID = '" +id+ "';";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.part = rows[0];
                }
                else{
                    res.error = true;
                    res.errorText = "Part not Found";
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
};