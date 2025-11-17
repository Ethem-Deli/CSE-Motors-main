const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * Works both locally and in production
 * *************** */

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;