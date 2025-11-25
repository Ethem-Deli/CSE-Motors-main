const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};
/**
* @typedef {Object} Message
* @property {number} message_id
* @property {string} message_subject
* @property {string} message_body
* @property {Date} message_created
* @property {number} message_to
* @property {number} message_from
* @property {boolean} message_read
* @property {boolean} message_archived
*/
/* get calssifications data */
Util.getClassifications = async function () {
  const data = await invModel.getClassifications();
  return data.rows; // pure data for navigation partial
};

/* BUILD CLASSIFICATION*/
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';

  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${
      classification_id == row.classification_id ? "selected" : ""
    }>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};

/* BUILD VEHICLE */
Util.buildClassificationGrid = async function (data) {
  let grid;

  if (data.length > 0) {
    grid = '<ul id="invdisplay">';
    data.forEach((vehicle) => {
      grid += `
        <li>
          <a href="../../inv/detail/${vehicle.inv_id}">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat("enUS").format(
              vehicle.inv_price
            )}</span>
          </div>
        </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

/*BUILD VEHICLE DETAIL HTML */
Util.buildVehicleDetailHTML = function (vehicle) {
  const priceFormatted = vehicle.inv_price.toLocaleString("enUS", {
    style: "currency",
    currency: "USD",
  });

  const milesFormatted = vehicle.inv_miles.toLocaleString("enUS");

  return `
    <section class="vehicledetail">
      <div class="vehicledetailcontainer">
        
        <div class="vehicleimage">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </div>

        <div class="vehicleinfo">
          <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
          <h2 class="price">${priceFormatted}</h2>

          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Mileage:</strong> ${milesFormatted} miles</p>
        </div>

      </div>
    </section>
  `;
};

/*ERROR HANDLING WRAPPER*/
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* JWT CHECK MIDDLEWARE*/
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/*UPDATE COOKIE (JWT) */
Util.updateCookie = (accountData, res) => {
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600,
  });

  const cookieOptions = {
    httpOnly: true,
    maxAge: 3600 * 1000,
  };

  if (process.env.NODE_ENV !== "development") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", accessToken, cookieOptions);
};

/*GENERAL LOGIN CHECK */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/*  MANAGER /ADMIN OR EMPLOYEE AUTHORIZATION
 */
Util.checkAuthorizationManager = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }

        if (
          accountData.account_type == "Employee" ||
          accountData.account_type == "Admin"
        ) {
          next();
        } else {
          req.flash("notice", "You are not authorized to modify inventory.");
          return res.redirect("/account/login");
        }
      }
    );
  } else {
    req.flash("notice", "You are not authorized to modify inventory.");
    return res.redirect("/account/login");
  }
};
/*INBOX TABLE BUILD*/
Util.buildInbox = (messages) => {
  let inboxList = `
    <table>
      <thead>
        <tr>
          <th>Received</th><th>Subject</th><th>From</th><th>Read</th>
        </tr>
      </thead>
      <tbody>`;

  messages.forEach((message) => {
    inboxList += `
      <tr>
        <td>${message.message_created.toLocaleString()}</td>
        <td><a href="/message/view/${message.message_id}">${message.message_subject}</a></td>
        <td>${message.account_firstname} ${message.account_lastname}</td>
        <td>${message.message_read ? "✓" : ""}</td>
      </tr>`;
  });

  inboxList += `
      </tbody>
    </table>
  `;
  return inboxList;
};

/*RECIPIENTLIST BUILD */
Util.buildRecipientList = (recipients, preselected = null) => {
  let list = `<select name="message_to" required>`;
  list += '<option value="">Select a recipient</option>';

  recipients.forEach((recipient) => {
    list += `<option value="${recipient.account_id}" ${
      preselected == recipient.account_id ? "selected" : ""
    }>
      ${recipient.account_firstname} ${recipient.account_lastname}
    </option>`;
  });

  list += "</select>";
  return list;
};

//EXPORT THE MODULE 
module.exports = Util;