// routes/service-routes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/add/:inv_id', serviceController.showAddForm);
router.post('/add/:inv_id', serviceController.validate, serviceController.addService);

router.get('/list/:inv_id', serviceController.listByVehicle);
router.post('/delete/:service_id', serviceController.delete);

module.exports = router;
