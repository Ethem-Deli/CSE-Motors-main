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
  return data.rows;
};

/* BUILD CLASSIFICATION*/
Util.buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    const classifications = Array.isArray(data.rows) ? data.rows : [];
    
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    
    classifications.forEach((classification) => {
      classificationList += `<option value="${classification.classification_id}"`;
      if (classification_id == classification.classification_id) {
        classificationList += " selected";
      }
      classificationList += `>${classification.classification_name}</option>`;
    });
    
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>';
  }
};

/* BUILD VEHICLE */
Util.buildClassificationGrid = async function (data) {
  let grid = '';
  
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    
    data.forEach(vehicle => {
      //currency formatting
      let formattedPrice;
      try {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
        formattedPrice = formatter.format(vehicle.inv_price);
      } catch (error) {
        // Fallback if Intl.NumberFormat fails
        formattedPrice = '$' + Math.round(vehicle.inv_price || 0).toLocaleString('en-US');
      }

      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}">
            <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
            <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
            <span class="price">${formattedPrice}</span>
          </a>
        </li>
      `;
    });
    
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  
  return grid;
};
//build item listing
Util.buildItemListing = async function (vehicle) {
  try {
    // Safe currency formatting
    let formattedPrice;
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      formattedPrice = formatter.format(vehicle.inv_price);
    } catch (error) {
      formattedPrice = '$' + Math.round(vehicle.inv_price || 0).toLocaleString('en-US');
    }

    const listingHTML = `
      <section class="car-listing">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="car-information">
          <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p class="price">${formattedPrice}</p>
          <hr>
          <h3>Description:</h3>
          <p>${vehicle.inv_description}</p>
          <dl>
            <dt>Color</dt>
            <dd>${vehicle.inv_color}</dd>
            <dt>Miles</dt>
            <dd>${vehicle.inv_miles.toLocaleString('en-US')}</dd>
          </dl>
        </div>
      </section>
    `;

    return listingHTML;
  } catch (error) {
    console.error("Error in buildItemListing:", error);
    return '<p class="notice">Sorry, there was an error displaying this vehicle.</p>';
  }
};

/*BUILD VEHICLE DETAIL HTML */
Util.buildVehicleDetailHTML = function (vehicleData) {
  try {
    // Safe currency formatting
    let formattedPrice;
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      formattedPrice = formatter.format(vehicleData.inv_price);
    } catch (error) {
      formattedPrice = '$' + Math.round(vehicleData.inv_price || 0).toLocaleString('en-US');
    }

    const detailHTML = `
      <div class="vehicle-detail-container">
        <div class="vehicle-image">
          <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_make} ${vehicleData.inv_model}">
        </div>
        <div class="vehicle-info">
          <h1>${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}</h1>
          <div class="price">${formattedPrice}</div>
          <p><strong>Description:</strong> ${vehicleData.inv_description}</p>
          <p><strong>Color:</strong> ${vehicleData.inv_color}</p>
          <p><strong>Miles:</strong> ${vehicleData.inv_miles.toLocaleString('en-US')}</p>
        </div>
      </div>
    `;

    return detailHTML;
  } catch (error) {
    console.error("Error in buildVehicleDetailHTML:", error);
    return '<p class="notice">Sorry, there was an error displaying vehicle details.</p>';
  }
};

/*ERROR HANDLING WRAPPER*/
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* JWT CHECK MIDDLEWARE*/
Util.checkJWTToken = (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      res.locals.loggedin = false;
      res.locals.accountData = null;
      return next();
    }
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret", (err, decoded) => {
      if (!err && decoded) {
        res.locals.loggedin = true;
        res.locals.accountData = decoded;
      } else {
        res.locals.loggedin = false;
        res.locals.accountData = null;
        if (err) console.error("JWT verify error:", err);
      }
      return next();
    });
  } catch (error) {
    console.error("JWT middleware unexpected error:", error);
    res.locals.loggedin = false;
    res.locals.accountData = null;
    return next();
  }
};

/*UPDATE COOKIE (JWT) */
Util.updateCookie = (accountData, res) => {
  const payload = {
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 3600 * 1000,
    secure: process.env.NODE_ENV === "production",
  });
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

/*  MANAGER/ADMIN OR EMPLOYEE AUT */
Util.checkAuthorizationManager = (req, res, next) => {
  if (!req.cookies.jwt) {
    req.flash("notice", "You are not authorized to modify inventory.");
    return res.redirect("/account/login");
  }
  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET || "fallback-secret", (err, accountData) => {
    if (err) {
      req.flash("notice", "Please log in");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      res.locals.accountData = accountData; 
      next();
    } else {
      req.flash("notice", "You are not authorized to modify inventory.");
      return res.redirect("/account/login");
    }
  });
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