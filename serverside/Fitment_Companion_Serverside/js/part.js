var connection = require('./db.js');

module.exports = {
    loadAllParts : function(callback){
        var res = {
            parts: [],
            total:0,
            error:false,
            errorText:""
        };
        var query = "SELECT parts.PART_ID, parts.NAME " +
            "FROM parts;";
        var query2 = "select count(parts.part_id) as PARTS_COUNT from parts;";

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
                    callback(JSON.stringify(res),null);
                }
            }
            else{
                res.error = true;
                res.errorText = err
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
        connection.db.query(query2, function(err,rows,fields){
            if(!err){
                if(rows.length > 0){
                    res.total = rows[0].PARTS_COUNT;
                }
                callback(null, JSON.stringify(res));
            }
            else{
                res.error = true;
                res.errorText = err;
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
    },
    removePart: function(data,callback){
        var res = {
            username:data.username,
            part_id:data.part_id,
            error:false,
            errorText: ""
        };

        var query = "UPDATE parts " +
            "SET IN_INVENTORY = 'FALSE' " +
            "WHERE PART_ID = " + data.part_id + ";";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log('part: ' + data.part_id + ' removed from inventory');
                res.error = false;
                callback(null, JSON.stringify(res));
            }
            else {
                res.error = true;
                res.errorText = err;
                console.log(err);
                callback(JSON.stringify(res),null);
            }
        });
    },
    returnPart : function(data, callback){
        var res = {
            username: data.username,
            part_id: data.part_id,
            error:false,
            errorText: ""
        };

        var query = "UPDATE parts " +
            "SET IN_INVENTORY = 'TRUE' " +
            "WHERE PART_ID = " + data.part_id + ";";

        connection.db.query(query, function(err,rows,fields){
            if(!err){
                console.log('part: ' + data.part_id + 'removed from inventory');
                res.error = false;
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