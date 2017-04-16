var connection = require('./db.js');
var crypto = require('crypto');

//Make all functions available to other scripts.
module.exports = {
    /**
     * Function to allow a user to login with username and password
     * @param data: username and passwrd (NON-HASHED)
     * @param callback: data to return
     */
  doLogin : function(data, callback){
      var res = [];
      var username = data.username;
      var password = data.pass;

      //Has the password 4 times using sha256
      var sha256_pass = crypto.createHash('sha256').update(password).digest("hex");
      sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");
      sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");
      sha256_pass = crypto.createHash('sha256').update(sha256_pass).digest("hex");

      //Query to find a user with the same credentials
      var query = "SELECT USER_ID, USER_NAME, USER_PASSWORD FROM users WHERE " +
          "USER_NAME = " + connection.db.escape(username) + " " +
          "AND " +
          "USER_PASSWORD = '" + sha256_pass + "';";

      connection.db.query(query, function(err,rows,fields) {
          if(!err) {
              if(rows.length > 0) {
                  //If user creds are correct - set as signed in
                  if ((username == rows[0].USER_NAME) && (sha256_pass == rows[0].USER_PASSWORD)) {
                      var query_2 = "UPDATE USERS" +
                          " SET USER_SIGNED_IN = 'TRUE' " +
                          "WHERE USER_NAME = " + connection.db.escape(username) + " AND " +
                          "USER_PASSWORD = '" + sha256_pass + "';";

                      connection.db.query(query_2, function(q2_err, q2_rows, q2_fields){
                          if(q2_err){
                              console.log(q2_err)
                          }
                          else{
                              console.log('User marked as signed in');
                          }
                      });

                      res.push({user_id: rows[0].USER_ID, user_name: rows[0].USER_NAME});
                      callback(null, JSON.stringify(res)); //Send JSON

                  }
              }else {
                  res.push({error: "invalid login"});
                  callback(JSON.stringify(res), null); //Send JSON(if user not exist)
              }

          }
          else{
              callback(err, null); //Send JSON if SQL Error
          }
      });
  },
    /**
     * Function to allow a user to logout
     * @param data: user to logout
     * @param callback: data to return
     */
    doLogout : function(data, callback){
      var user = JSON.parse(data);
      var userid = user.userid;
      var username = user.username;
      var res = [];

      //Query to set the user as not signed in.
      var query = "UPDATE USERS" +
              " SET USER_SIGNED_IN = 'FALSE' " +
              "WHERE USER_ID = '" + userid + "' AND " +
              "USER_NAME = " + connection.db.escape(username) + ";";

      //Run the query
      connection.db.query(query, function(err,rows,fields){
         if(!err){
             res.push({msg: "signout success", id:userid, user:username});
             callback(null, JSON.stringify(res));
         }
         else{
             callback(err, null)
         }
      });

    }

};