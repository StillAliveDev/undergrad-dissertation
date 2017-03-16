var connection = require('./db.js');

module.exports = {
  doLogin : function(data, callback){
      var res = [];
      var username = data.username;
      var password = data.pass;
      var query = "SELECT USER_ID, USER_NAME, USER_PASSWORD FROM users WHERE " +
          "USER_NAME = '" + username + "' " +
          "AND " +
          "USER_PASSWORD = '" + password + "';";

      connection.db.query(query, function(err,rows,fields) {
          if(!err) {
              if(rows.length > 0) {
                  if ((username == rows[0].USER_NAME) && (password == rows[0].USER_PASSWORD)) {
                      var query_2 = "UPDATE USERS" +
                          " SET USER_SIGNED_IN = 'TRUE' " +
                          "WHERE USER_NAME = '" + username + "' AND " +
                          "USER_PASSWORD = '" + password + "';";

                      connection.db.query(query_2, function(q2_err, q2_rows, q2_fields){
                          if(q2_err){
                              console.log(q2_err)
                          }
                          else{
                              console.log('Done - no worry about asynchronous here');
                          }
                      });

                      res.push({user_id: rows[0].USER_ID, user_name: rows[0].USER_NAME});
                      callback(null, JSON.stringify(res));

                  }
              }else {
                  res.push({error: "invalid login"});
                  callback(JSON.stringify(res), null);
              }

          }
          else{
              callback(err, null);
          }
      });
  },
    doLogout : function(data, callback){
      var user = JSON.parse(data);
      console.log(data);
      var userid = user.userid;
      var username = user.username;
      var res = [];

      var query = "UPDATE USERS" +
              " SET USER_SIGNED_IN = 'FALSE' " +
              "WHERE USER_ID = '" + userid + "' AND " +
              "USER_NAME = '" + username + "';";

      connection.db.query(query, function(err,rows,fields){
         if(!err){
             res.push({msg: "signout success"});
             callback(null, JSON.stringify(res));
         }
         else{
             callback(err, null)
         }
      });

    }

};