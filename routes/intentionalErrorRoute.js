const express = require("express");
const router = express.Router();
const intentionalErrorController = require("../controllers/intentionalErrorController");
const utilities = require("../utilities");

// Optional middleware causing error
router.use("/", utilities.handleErrors(async (req, res, next) => {
    // You may uncomment this to test middleware errors:
    // throw new Error("Middleware intentionally throwing an exception");
    next();
}));

// Route 1: /ierror → causes default 500
router.get("/", utilities.handleErrors(intentionalErrorController.causeError));

// Route 2: /ierror/trigger-error → throws test error
router.get("/trigger-error", utilities.handleErrors(intentionalErrorController.throwError));

module.exports = router;
