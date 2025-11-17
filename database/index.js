/********************************************
 * PostgreSQL Pool Connection File
 * Works for BOTH local development and Render
 ********************************************/
require("dotenv").config();
const { Pool } = require("pg");

let pool;

/**
 * In production (Render)
 * - Use DATABASE_URL
 * - Enable SSL
 */
if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  /** Development (local machine) */
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

module.exports = pool;
