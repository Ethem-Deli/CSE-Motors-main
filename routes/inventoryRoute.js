// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Admin authorization
router.use(
  [
    "/add-classification",
    "/add-inventory",
    "/edit/:inventoryId",
    "/update",
    "/delete/:inventoryId",
    "/delete/"
  ],
  utilities.checkAuthorizationManager
);

// Management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Inventory by classification
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle detail view
router.get("/detail/:inventoryId",
  utilities.handleErrors(invController.buildByInventoryId)
);

// Add classification form
router.get("/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Add classification action
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory form
router.get("/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Add inventory action
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Edit vehicle form
router.get("/edit/:inventoryId",
  utilities.handleErrors(invController.buildEditInventory)
);

// Update vehicle
router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete vehicle form
router.get("/delete/:inventoryId",
  utilities.handleErrors(invController.buildDeleteInventory)
);

// Delete vehicle action
router.post(
  "/delete/",
  utilities.handleErrors(invController.deleteInventory)
);

// Inventory API
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
