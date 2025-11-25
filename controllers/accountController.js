const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");

/*registration view*/
async function buildRegister(req, res, next) {
  res.render("account/register", {
    title: "Register",
    errors: null,
  });
}

/*Process Registration */
async function registerAccount(req, res) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;
// Hash the password before storing it  
  let hashedPassword;
  try {
    // regular password and cost is generated automatic
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "There was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      errors: null,
    });
  } else {
    req.flash("notice", "Registration failed.");
    return res.status(501).render("account/register", {
      title: "Register",
      errors: null,
    });
  }
}

/* login view */
async function buildLogin(req, res, next) {
  res.render("account/login", {
    title: "Login",
    errors: null,
  });
}

/*login post request*/
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  // if account username or mail not found
  if (!accountData) {
    req.flash("notice", "Incorrect credentials.");
    return res.status(400).render("account/login", {
      title: "Login",
      errors: null,
      account_email,
    });
  }

  try {
    // if user uses correct password
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      utilities.updateCookie(accountData, res);
      return res.redirect("/account/");
    }
    // if users uses WRONG password
    else {
      req.flash("notice", "Incorrect credentials.");
      return res.status(400).render("account/login", {
        title: "Login",
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error(error);
    req.flash("notice", "Server error.");
    return res.status(500).render("account/login", {
      title: "Login",
      errors: null,
    });
  }
}

/* Account management*/
async function buildAccountManagementView(req, res) {
  const unread = await messageModel.getMessageCountById(
    res.locals.accountData.account_id
  );

  res.render("account/account-management", {
    title: "Account Management",
    errors: null,
    unread,
  });
}

/* Logout request*/
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  delete res.locals.accountData;
  res.locals.loggedin = false;
  req.flash("notice", "Logout successful.");
  return res.redirect("/");
}

/* Account update view GET */
async function buildUpdate(req, res, next) {
  const accountDetails = await accountModel.getAccountById(
    req.params.accountId
  );

  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = accountDetails;

  res.render("account/update", {
    title: "Update Account",
    errors: null,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  });
}

/* Account update POST */
async function updateAccount(req, res) {
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body;

  const regResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (regResult) {
    req.flash("notice", `Account updated successfully.`);

    const accountData = await accountModel.getAccountById(account_id);
    delete accountData.account_password;

    res.locals.accountData.account_firstname =
      accountData.account_firstname;

    utilities.updateCookie(accountData, res);

    return res.status(201).render("account/account-management", {
      title: "Account Management",
      errors: null,
    });
  } else {
    req.flash("notice", "Account update failed.");
    return res.status(501).render("account/update", {
      title: "Update Account",
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* Password update POST */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Password hashing error.");
    return res.status(500).render("account/update", {
      title: "Update Password",
      errors: null,
    });
  }

  const result = await accountModel.updatePassword(account_id, hashedPassword);

  if (result) {
    req.flash("notice", "Password updated successfully.");
    return res.status(201).render("account/account-management", {
      title: "Account Management",
      errors: null,
    });
  } else {
    req.flash("notice", "Password update failed.");
    return res.status(501).render("account/update", {
      title: "Update Password",
      errors: null,
    });
  }
}

async function buildManageAccounts(req, res, next) {
  try {
    const accounts = await accountModel.getAllAccounts(); 
    res.render("account/manage", { 
      title: "Manage Accounts",
      accounts,
      errors: null
    });
  } catch (error) {
    next(error);
  }
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
  buildManageAccounts,
};