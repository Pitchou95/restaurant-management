const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Home route
router.get('/', indexController.getHome);

// Dashboard / Analytics route
router.get('/dashboard', indexController.getDashboard);

module.exports = router;
