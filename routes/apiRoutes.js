const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Dish API endpoints
router.get('/dishes', apiController.getAllDishes);
router.get('/dishes/:id', apiController.getDishById);

// Chef API endpoints
router.get('/chefs', apiController.getAllChefs);
router.get('/chefs/:id', apiController.getChefById);

// Analytics API endpoint
router.get('/stats', apiController.getStats);

module.exports = router;
