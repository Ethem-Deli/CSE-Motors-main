/*This server.js file is the primary file of the
 application. It is used to control the project.*/
/*Require Statements*/
 
// Their stuff meaning the system stuff
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session); //  Added: session store for PostgreSQL
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // to ensure environment variables are loaded

// My stuff the files i have to edit
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require("./routes/accountRoute.js");
const messageRoute = require("./routes/messageRoute.js");
const intentionalErrorRoute = require("./routes/intentionalErrorRoute.js");
const utilities = require("./utilities/index.js");
const pool = require("./database"); // PostgreSQL pool connection

// Init
const app = express();  

/* Middleware*/
app.use(
  session({
    store: new pgSession({
      pool: pool,
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

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parser middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Cookie parser
app.use(cookieParser());

// JWT checker
app.use(utilities.checkJWTToken);

/*View and Templates*/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* Routes*/
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", accountRoute);

// Message routes
app.use("/message", messageRoute);

// Intentional error route (used for testing)
app.use("/ierror", intentionalErrorRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Unfortunately, we don't have that page in stock.",
  });
});

/* Express Error Handler */
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  console.dir(err);
  let message =
    err.status == 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* Local Server Information*/
const port = process.env.PORT || 5500;
// const host = process.env.HOST || "0.0.0.0"; // uncomment this line before commint for Render
const host = process.env.HOST || "localhost"; // uncomment this line for local dev

/*Log statement to confirm server operation*/
app.listen(port, host, () => {
  console.log(` App listening on ${host}:${port}`);
});