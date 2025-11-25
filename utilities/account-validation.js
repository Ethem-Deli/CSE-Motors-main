const utilities = require("../utilities");
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator");
const validate = {};

/* Registration Data Validation Rules */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // if no fname the error this message will sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // if no lname the error this message will sent.
    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => { 
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
  ];
};

/*Registration Data Validation Rules*/
validate.updateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),// if no fname the error this message will sent.
    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // if no lname the error this message will sent..

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        console.dir(req.body);
        const emailExists = await accountModel.checkExistingEmail(
          account_email, req.body.old_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
  ];
};

/* Login Data Validation Rules*/
validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
      // password is required and must be strong password same as most of the pages
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ];
};

/*Update Password Data Validation Rule */
validate.updatePasswordRules = () => {
  return [
    // password is required and must be strong password same as most of the pages
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/*Check data if validation fails return errors, if passed continue to registration */


validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/register", {
      errors,
      title: "Registration",
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

/* Check data and return errors or continue to update */
validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/update/", {
          errors,
          title: "Update",
          nav,
          account_id,
          account_firstname,
          account_lastname,
          account_email,
      });
      return;
  }
  next();
};

/* Check data and return errors or continue to update passwor */
validate.checkUpdatePasswordData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/update", {
          errors,
          title: "Update",
          nav,
          account_id,
          account_firstname,
          account_lastname,
          account_email,
      });
      return;
  }
  next();
};

/* Check data and return errors or continue to registration */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/login", {
          errors,
          title: "Login",
          nav,
          account_email,
      });
      return;
  }
  next();
};
module.exports = validate;