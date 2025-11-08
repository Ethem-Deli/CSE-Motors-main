const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * Works both locally and in production
 * *************** */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render’s PostgreSQL
  },
});

// For debugging during local development
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("Executed query:", text);
      return res;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
  pool
};