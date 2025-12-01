const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");

/*registration view*/
async function buildRegister(req, res) {
  res.render("account/register", {
    title: "Register",
    errors: null
  });
}

/*Process Registration */
async function registerAccount(req, res) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    }

    req.flash("notice", "Registration failed.");
    return res.render("account/register", { title: "Register", errors: null });

  } catch (error) {
    req.flash("notice", "Registration processing error.");
    return res.render("account/register", { title: "Register", errors: null });
  }
}

/* login view */
async function buildLogin(req, res) {
  res.render("account/login", { title: "Login", errors: null });
}

/*login post request*/
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
// if account username or mail not found
  if (!accountData) {
    req.flash("notice", "Incorrect credentials.");
    return res.render("account/login", { title: "Login", errors: null, account_email });
  }

  if (!(await bcrypt.compare(account_password, accountData.account_password))) {
    req.flash("notice", "Incorrect credentials.");
    return res.render("account/login", { title: "Login", errors: null, account_email });
  }

  delete accountData.account_password;
  utilities.updateCookie(accountData, res);

  return res.redirect("/account/");
}

/* Account management*/
async function buildAccountManagementView(req, res) {
  const unread = await messageModel.getMessageCountById(
    res.locals.accountData.account_id
  );

  res.render("account/account-management", {
    title: "Account Management",
    errors: null,
    unread
  });
}

/* Logout request*/
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  delete res.locals.accountData;
  req.flash("notice", "Logout successful.");
  return res.redirect("/");
}

/* Account update view GET */
async function buildUpdate(req, res) {
  const accountDetails = await accountModel.getAccountById(req.params.accountId);

  res.render("account/update", {
    title: "Update Account",
    errors: null,
    ...accountDetails
  });
}

/* Account update POST */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  const result = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (!result) {
    req.flash("notice", "Account update failed.");
    return res.render("account/update", {
      title: "Update Account",
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    });
  }

  req.flash("notice", "Account updated successfully.");

  const updatedAccount = await accountModel.getAccountById(account_id);
  delete updatedAccount.account_password;
  res.locals.accountData = updatedAccount;
  utilities.updateCookie(updatedAccount, res);

  return res.redirect("/account/");
}

/* Password update POST */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Password hashing error.");
    return res.render("account/update", {
      title: "Update Account",
      errors: null,
      ...res.locals.accountData
    });
  }

  const result = await accountModel.updatePassword(account_id, hashedPassword);

  if (!result) {
    req.flash("notice", "Password update failed.");
    return res.render("account/update", {
      title: "Update Account",
      errors: null,
      ...res.locals.accountData
    });
  }

  req.flash("notice", "Password updated successfully.");
  return res.redirect("/account/");
}

async function buildManageAccounts(req, res) {
  const accounts = await accountModel.getAllAccounts();

  res.render("account/manage", {
    title: "Manage Accounts",
    accounts,
    errors: null
  });
}


//exports
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagementView,
  accountLogout,
  buildUpdate,
  updateAccount,
  updatePassword,
  buildManageAccounts
};