const ServiceModel = require('../models/service-model');
const inventoryModel = require('../models/inventory-model');
const { body, validationResult } = require('express-validator');

const serviceController = {};

/** Show form to add a service record */
serviceController.showAddForm = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!inv_id) return res.status(400).send('Invalid vehicle id');

    const vehicle = await inventoryModel.getVehicleById(inv_id);
    if (!vehicle) return res.status(404).render('errors/404', { message: 'Vehicle not found' });

    res.render('service/add-service', { 
      title: `Add Service - ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle, 
      errors: null, 
      formData: {} 
    });
  } catch (err) {
    next(err);
  }
};

/** POST add service validation */
serviceController.validate = [
  body('service_date').isISO8601().withMessage('Service date is required and must be a valid date'),
  body('mileage').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Mileage must be a positive integer'),
  body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
  body('cost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Cost must be a non-negative number'),
];

/** Handle add service POST */
serviceController.addService = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!inv_id) return res.status(400).send('Invalid vehicle id');

    const errors = validationResult(req);
    const formData = {
      service_date: req.body.service_date,
      mileage: req.body.mileage,
      description: req.body.description,
      cost: req.body.cost,
      service_center: req.body.service_center,
      next_service_date: req.body.next_service_date,
      inv_id,
    };

    if (!errors.isEmpty()) {
      const vehicle = await inventoryModel.getVehicleById(inv_id);
      return res.status(400).render('service/add-service', { 
        title: `Add Service - ${vehicle.inv_make} ${vehicle.inv_model}`,
        vehicle, 
        errors: errors.array(), 
        formData 
      });
    }

    await ServiceModel.addService(formData);

    req.flash('success', 'Service record saved.');
    return res.redirect(`/service/list/${inv_id}`);
  } catch (err) {
    next(err);
  }
};

/** List all service records for a vehicle */
serviceController.listByVehicle = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!inv_id) return res.status(400).send('Invalid vehicle id');

    const vehicle = await inventoryModel.getVehicleById(inv_id);
    if (!vehicle) return res.status(404).render('errors/404', { message: 'Vehicle not found' });

    const records = await ServiceModel.getByVehicle(inv_id);

    res.render('service/service-list', { 
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} - Service History`,
      vehicle, 
      records 
    });
  } catch (err) {
    next(err);
  }
};

/** Delete a service record */
serviceController.delete = async (req, res, next) => {
  try {
    const service_id = parseInt(req.params.service_id, 10);
    if (!service_id) return res.status(400).send('Invalid id');

    const affected = await ServiceModel.deleteById(service_id);
    if (!affected) {
      return res.status(404).send('Record not found');
    }

    req.flash('success', 'Record deleted');
    return res.redirect('back');
  } catch (err) {
    next(err);
  }
};

module.exports = serviceController;