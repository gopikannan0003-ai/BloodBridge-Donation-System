const mysql = require("mysql2");
require("dotenv").config();

// ==========================================
// MYSQL DATABASE CONNECTION
// ==========================================

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
});

// ==========================================
// CONNECT TO DATABASE
// ==========================================

db.connect((err) => {

    if (err) {

        console.log("Database connection failed!");
        console.log("Error:", err.message);

        return;
    }

    console.log("MySQL database connected successfully.");

    // ==========================================
    // DATABASE CONNECTION DIAGNOSTICS
    // ==========================================

    console.log(
        "DB HOST:",
        process.env.MYSQLHOST
    );

    console.log(
        "DB NAME:",
        process.env.MYSQLDATABASE
    );

    console.log(
        "DB PORT:",
        process.env.MYSQLPORT
    );
});

// ==========================================
// EXPORT DATABASE CONNECTION
// ==========================================

module.exports = db;