const pool = require("../database/");

/* Register new account */
async function registerAccount(
  firstname,
  lastname,
  email,
  password
) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1,$2,$3,$4,'Client') RETURNING *";
    const result = await pool.query(sql, [
      firstname,
      lastname,
      email,
      password]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/* Check for existing email */
async function checkExistingEmail(email, excludedEmail = null) {
  try {
    const sql = excludedEmail 
      ? "SELECT * FROM account WHERE account_email = $1 AND account_email != $2" 
      : "SELECT * FROM account WHERE account_email = $1";
    const params = excludedEmail ? [email, excludedEmail] : [email];
    const result = await pool.query(sql, params);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
}

/* Return account data using email address */
async function getAccountByEmail(email) {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [email]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/* Return account data using account id */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/* Update account info */
async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const sql = "UPDATE account SET account_firstname=$1, account_lastname=$2, account_email=$3 WHERE account_id=$4 RETURNING *";
    const result = await pool.query(sql, [firstname, lastname, email, account_id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/* Update password */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password=$1 WHERE account_id=$2 RETURNING *";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/* Get all accounts for management */
async function getAllAccounts() {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_id";
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
async function getAccountList() {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname 
      FROM account
      ORDER BY account_lastname ASC;
    `;
    const data = await pool.query(sql);
    return data.rows;
  } catch (error) {
    console.error("getAccountList error:", error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
  getAccountList,
  getAllAccounts,
};
