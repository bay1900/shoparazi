var mysql = require('mysql');


var pool  = mysql.createPool( { 
    connectionLimit : 50,
    host :  process.env.HOSTNAME, 
    user :  process.env.USERS,     
    password : process.env.PASSWORD,
    database : process.env.DATABASES,
    // port : process.env.PORT,
})


module.exports = pool;   
