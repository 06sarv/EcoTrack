const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config.js");

// Create a connection pool to the database
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log("Successfully connected to the database.");
    connection.release();
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

module.exports = {
  pool,
  query: async (sql, params) => {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  },
  transaction: async (callback) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};