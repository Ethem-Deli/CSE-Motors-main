const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");

const validate = {};

/* Registration Rules */
validate.registrationRules = () => [
  body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
  body("account_lastname").trim().escape().notEmpty().withMessage("Please provide a last name."),
  body("account_email")
    .trim().isEmail().normalizeEmail().withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const exists = await accountModel.checkExistingEmail(account_email);
      if (exists) throw new Error("Email exists. Please log in or use a different email");
    }),
];

/* Update Rules */
validate.updateRules = () => [
  body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
  body("account_lastname").trim().escape().notEmpty().withMessage("Please provide a last name."),
  body("account_email")
    .trim().isEmail().normalizeEmail().withMessage("A valid email is required.")
    .custom(async (account_email, { req }) => {
      const exists = await accountModel.checkExistingEmail(account_email, req.body.old_email);
      if (exists) throw new Error("Email exists. Please log in or use a different email");
    }),
];

/* Login Rules */
validate.loginRules = () => [
  body("account_email").trim().isEmail().normalizeEmail().withMessage("A valid email is required."),
  body("account_password").trim().notEmpty().withMessage("Password is required"),
];

/* Password Update Rules */
validate.updatePasswordRules = () => [
  body("account_password").trim().notEmpty().isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

/* Validation Middlewares */
validate.checkRegData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/register", {
      title: "Registration",
      errors,
      ...req.body,
    });
  }
  next();
};

validate.checkUpdateData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      errors,
      ...req.body,
    });
  }
  next();
};

validate.checkUpdatePasswordData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Password",
      errors,
      ...req.body,
    });
  }
  next();
};

validate.checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/login", {
      title: "Login",
      errors,
      ...req.body,
    });
  }
  next();
};
module.exports = validate;