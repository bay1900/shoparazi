const express = require("express");
const app     = express();

const cron = require('node-cron');


require('dotenv').config()

// For parsing application/json
app.use(express.json());
 
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const PORT    = process.env.PORT;




const route = require('./routes/route')

app.use('/', route)
app.listen(PORT, console.log("Server don start for port: " + PORT))
