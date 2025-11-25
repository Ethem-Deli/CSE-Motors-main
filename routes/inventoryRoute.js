const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route middleware for management functionality
router.use(
  [
    "/addClassification",
    "/addInventory",
    "/edit/:inventoryId",
    "/update",
    "/delete/:inventoryId",
    "/delete/",
  ],
  utilities.checkAuthorizationManager
);

// Misc. routes
// Route to build inventory by classification view
router.get(
  "/",
  utilities.checkAuthorizationManager,
  utilities.handleErrors(invController.buildManagementView)
);

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:inventoryId",
  utilities.handleErrors(invController.buildByInventoryId)
);

// Classification management routes
router.get(
  "/addClassification",
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/addClassification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Inventory management routes
router.get(
  "/addInventory",
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/addInventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// edit/update inventory
router.get(
  "/edit/:inventoryId",
  utilities.handleErrors(invController.buildEditInventory)
);
router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete vehicle information routes
router.get(
  "/delete/:inventoryId",
  utilities.handleErrors(invController.buildDeleteInventory)
);
router.post(
  "/delete/",
  utilities.handleErrors(invController.deleteInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
