const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating a Dish
const dishValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Dish name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'])
    .withMessage('Please select a valid category'),
  body('cuisine')
    .trim()
    .notEmpty()
    .withMessage('Cuisine type is required'),
  body('prepTime')
    .notEmpty()
    .withMessage('Preparation time is required')
    .isInt({ min: 1 })
    .withMessage('Prep time must be at least 1 minute'),
  body('calories')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Calories must be 0 or more'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid web URL'),
];

// Validation rules for creating/updating a Chef
const chefValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Chef name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Professional title is required'),
  body('specialty')
    .trim()
    .notEmpty()
    .withMessage('Culinary specialty is required'),
  body('experienceYears')
    .notEmpty()
    .withMessage('Years of experience are required')
    .isInt({ min: 1 })
    .withMessage('Experience must be at least 1 year'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('avatarUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

// Validation rules for reviews
const reviewValidationRules = [
  body('authorName')
    .trim()
    .notEmpty()
    .withMessage('Your name is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 5 })
    .withMessage('Review comment must be at least 5 characters long'),
];

module.exports = {
  dishValidationRules,
  chefValidationRules,
  reviewValidationRules,
  validationResult,
};
