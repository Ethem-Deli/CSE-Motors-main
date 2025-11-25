// This server.js file is the primary file of the application

// Their stuff - meaning the system stuff
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// My stuff - the files i have to edit
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require("./routes/accountRoute.js");
const messageRoute = require("./routes/messageRoute.js");
const intentionalErrorRoute = require("./routes/intentionalErrorRoute.js");
const utilities = require("./utilities/index.js");
const pool = require("./database");
// Init
const app = express();
const invModel = require("./models/inventory-model");
// Sessions/MIDDLEWARE
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

//session data available to views
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false;
  res.locals.accountData = req.session.accountData || {};
  next();
});

// Messages/middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parsermiddleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// JWT checking
app.use(utilities.checkJWTToken);

/* view and templates layout */
app.set("view engine", "ejs");
app.use(expressLayouts);

// layout file
app.set("layout", "./layouts/layout");

// Routes 
app.use(static);

app.use(async (req, res, next) => {
  try {
    const classificationsResult = await invModel.getClassifications();
    res.locals.classifications = Array.isArray(classificationsResult.rows) ? classificationsResult.rows : [];
    next();
  } catch (error) {
    console.error("Error loading classifications:", error);
    res.locals.classifications = [];
    next();
  }
});

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory
app.use("/inv", inventoryRoute);

// Account
app.use("/account", accountRoute);

// Message
app.use("/message", messageRoute);

// Intentional Error test
app.use("/ierror", intentionalErrorRoute);

// 404 handler
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Unfortunately, we don't have that page in stock.",
  });
});

/* Error Handler */
app.use(async (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  console.dir(err);
  let message =
    err.status == 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.render("errors/error", {
    title: err.status || "Server Error",
    message
  });
});


/* Start server */
const port = process.env.PORT || 5500;
// const host = process.env.HOST || "0.0.0.0"; // for Render deployment
const host = process.env.HOST || "localhost"; // local dev

app.listen(port, host, () => {
  console.log(`App listening on http://${host}:${port}`);
});
// psql -h localhost -U edelicse340 -d edelicse340