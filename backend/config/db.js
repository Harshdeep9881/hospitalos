const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,      // mysql
  user: process.env.DB_USER,      // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection with retry
const connectWithRetry = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ MySQL connection failed");
      console.error("Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
      return;
    }

    console.log("✅ MySQL connected successfully");
    connection.release();
  });
};

connectWithRetry();

module.exports = db;
