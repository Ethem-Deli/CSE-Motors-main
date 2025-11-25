//we need this file to insert admin to database after inserting in pgadmin query tools
const db = require("./database");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("Edeli@cse340", 10);

    const sql = `
      INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (account_email) DO NOTHING
    `;
    const values = ["Edeli", "Admin", "edeli@cse340.com", hashedPassword, "Admin"];

    await db.query(sql, values);
    console.log("Admin user inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error inserting admin:", err);
    process.exit(1);
  }
}

createAdmin();