const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const { dishValidationRules, reviewValidationRules } = require('../middleware/validation');

// Export dishes to CSV (Must be declared before /:id)
router.get('/export/csv', dishController.exportCSV);

// List dishes with pagination & search
router.get('/', dishController.getDishes);

// Form to add a new dish
router.get('/new', dishController.renderNewForm);

// Create new dish
router.post('/', dishValidationRules, dishController.createDish);

// View single dish details
router.get('/:id', dishController.getDishById);

// Form to edit existing dish
router.get('/:id/edit', dishController.renderEditForm);

// Update existing dish
router.put('/:id', dishValidationRules, dishController.updateDish);

// Delete dish
router.delete('/:id', dishController.deleteDish);

// Add customer review to a dish
router.post('/:id/reviews', reviewValidationRules, dishController.addReview);

module.exports = router;
