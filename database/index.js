const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "production") {
  // Render production database
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local database
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

module.exports = pool;
