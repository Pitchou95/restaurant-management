const express = require('express');
const router = express.Router();
const chefController = require('../controllers/chefController');
const { chefValidationRules } = require('../middleware/validation');

// List chefs
router.get('/', chefController.getChefs);

// Form to add a new chef
router.get('/new', chefController.renderNewForm);

// Create new chef
router.post('/', chefValidationRules, chefController.createChef);

// View single chef profile
router.get('/:id', chefController.getChefById);

// Form to edit existing chef
router.get('/:id/edit', chefController.renderEditForm);

// Update existing chef
router.put('/:id', chefValidationRules, chefController.updateChef);

// Delete chef
router.delete('/:id', chefController.deleteChef);

module.exports = router;
