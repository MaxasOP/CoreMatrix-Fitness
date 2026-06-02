const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateWorkout = [
  body('name')
    .trim()
    .notEmpty().withMessage('Workout name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Workout name must be between 2 and 100 characters'),
  body('duration_minutes')
    .isInt({ min: 1, max: 1440 }).withMessage('Duration must be an integer between 1 and 1440 minutes'),
  body('calories_burned')
    .isInt({ min: 1 }).withMessage('Calories burned must be a positive integer'),
  body('log_date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for log_date (YYYY-MM-DD)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateMeal = [
  body('name')
    .trim()
    .notEmpty().withMessage('Meal name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Meal name must be between 2 and 100 characters'),
  body('calories')
    .isInt({ min: 1 }).withMessage('Calories must be a positive integer'),
  body('protein_g')
    .isInt({ min: 0 }).withMessage('Protein must be a non-negative integer'),
  body('carbs_g')
    .isInt({ min: 0 }).withMessage('Carbohydrates must be a non-negative integer'),
  body('fat_g')
    .isInt({ min: 0 }).withMessage('Fat must be a non-negative integer'),
  body('log_date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for log_date (YYYY-MM-DD)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateId = [
  param('id').custom(value => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid ID format');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateWorkout,
  validateMeal,
  validateId
};
