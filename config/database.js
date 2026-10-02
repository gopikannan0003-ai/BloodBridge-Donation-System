const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed!");
        console.log("Error:", err.message);
        return;
    }

    console.log("MySQL database connected successfully.");
});

module.exports = db;