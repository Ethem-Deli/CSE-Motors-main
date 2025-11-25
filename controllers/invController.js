const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  let grid;
  let className;
  if (data.length) {
    grid = await utilities.buildClassificationGrid(data);
    className = data[0].classification_name;
  } else {
    grid = "";
    className = "No";
  }

  res.render("inventory/classification", {
    title: className + " vehicles",
    grid,
  });
};

/*Build the view to display a single vehicle */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventoryId = req.params.inventoryId;
  const data = await invModel.getInventoryByInventoryId(inventoryId);
  const listing = await utilities.buildItemListing(data[0]);
  const itemName = `${data[0].inv_make} ${data[0].inv_model}`;

  res.render("inventory/listing", {
    title: itemName,
    listing,
  });
};

/* Build vehicle detail view */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) throw new Error("Vehicle not found");

    const vehicleDetail = utilities.buildVehicleDetailHTML(vehicleData);

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      vehicleDetail,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

/* Vehicle Management Controllers */
invCont.buildManagementView = async function (req, res, next) {
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    errors: null,
    classificationSelect,
  });
};

invCont.buildAddClassification = async function (req, res, next) {
  res.render("inventory/addClassification", {
    title: "Add New Classification",
    errors: null,
  });
};

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const response = await invModel.addClassification(classification_name);

  if (response) {
    req.flash(
      "notice",
      `The "${classification_name}" classification was successfully added.`
    );
    const classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Vehicle Management",
      errors: null,
      classificationSelect,
    });
  } else {
    req.flash("notice", `Failed to add ${classification_name}`);
    res.render("inventory/addClassification", {
      title: "Add New Classification",
      errors: null,
    });
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  let classifications = await utilities.buildClassificationList();

  res.render("inventory/addInventory", {
    title: "Add Vehicle",
    errors: null,
    classifications,
  });
};

invCont.addInventory = async function (req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const response = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (response) {
    req.flash(
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} successfully added.`
    );
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.render("inventory/management", {
      title: "Vehicle Management",
      classificationSelect,
      errors: null,
    });
  } else {
    req.flash("notice", "There was a problem.");
    res.render("inventory/addInventory", {
      title: "Add Vehicle",
      errors: null,
    });
  }
};

invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId);
  const inventoryData = (await invModel.getInventoryByInventoryId(inventory_id))[0];
  const name = `${inventoryData.inv_make} ${inventoryData.inv_model}`;
  let classifications = await utilities.buildClassificationList(inventoryData.classification_id);

  res.render("inventory/editInventory", {
    title: "Edit " + name,
    errors: null,
    classifications,
    inv_id: inventoryData.inv_id,
    inv_make: inventoryData.inv_make,
    inv_model: inventoryData.inv_model,
    inv_year: inventoryData.inv_year,
    inv_description: inventoryData.inv_description,
    inv_image: inventoryData.inv_image,
    inv_thumbnail: inventoryData.inv_thumbnail,
    inv_price: inventoryData.inv_price,
    inv_miles: inventoryData.inv_miles,
    inv_color: inventoryData.inv_color,
    classification_id: inventoryData.classification_id,
  });
};

invCont.updateInventory = async function (req, res, next) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const response = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (response) {
    const itemName = response.inv_make + " " + response.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classifications = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/editInventory", {
      title: "Edit " + itemName,
      errors: null,
      classifications,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

invCont.buildDeleteInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId);
  const inventoryData = (await invModel.getInventoryByInventoryId(inventory_id))[0];
  const name = `${inventoryData.inv_make} ${inventoryData.inv_model}`;

  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    errors: null,
    inv_id: inventoryData.inv_id,
    inv_make: inventoryData.inv_make,
    inv_model: inventoryData.inv_model,
    inv_year: inventoryData.inv_year,
    inv_price: inventoryData.inv_price,
  });
};

invCont.deleteInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.body.inv_id);
  const { inv_make, inv_model, inv_year, inv_price } = req.body;
  const queryResponse = await invModel.deleteInventory(inventory_id);
  const itemName = `${inv_make} ${inv_model}`;

  if (queryResponse) {
    req.flash("notice", `The ${itemName} was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/deleteInventory", {
      title: "Delete " + itemName,
      errors: null,
      inv_id: inventory_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;