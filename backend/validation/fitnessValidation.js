const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateWorkout = [
  body('name')
    .trim()
    .notEmpty().withMessage('Workout name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Workout name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('sets')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Sets must be an integer between 1 and 100'),
  body('reps')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Reps must be an integer between 1 and 500'),
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 2000 }).withMessage('Weight must be between 0 and 2000 kg'),
  body('intensity')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Intensity must be low, medium, or high'),
  body('duration_minutes')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 1440 }).withMessage('Duration must be an integer between 1 and 1440 minutes'),
  body('calories_burned')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Calories burned must be a non-negative number'),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for date (YYYY-MM-DD)'),
  body('log_date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for log_date (YYYY-MM-DD)'),
  body('plan_id').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid workout plan ID'),
  body('plan_day_index').optional({ values: 'null' }).isInt({ min: 0, max: 6 }).toInt(),
  body('plan_exercise_index').optional({ values: 'null' }).isInt({ min: 0, max: 50 }).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map(e => e.msg).join(', ');
      return res.status(400).json({
        error: errorMsg,
        message: errorMsg,
        errors: errors.array()
      });
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
    .optional()
    .isFloat({ min: 0 }).withMessage('Calories must be a non-negative number'),
  body('protein')
    .optional()
    .isFloat({ min: 0 }).withMessage('Protein must be a non-negative number'),
  body('protein_g')
    .optional()
    .isFloat({ min: 0 }).withMessage('Protein must be a non-negative number'),
  body('carbs')
    .optional()
    .isFloat({ min: 0 }).withMessage('Carbohydrates must be a non-negative number'),
  body('carbs_g')
    .optional()
    .isFloat({ min: 0 }).withMessage('Carbohydrates must be a non-negative number'),
  body('fat')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fat must be a non-negative number'),
  body('fat_g')
    .optional()
    .isFloat({ min: 0 }).withMessage('Fat must be a non-negative number'),
  body('type')
    .optional()
    .trim(),
  body('date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for date (YYYY-MM-DD)'),
  body('log_date')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format for log_date (YYYY-MM-DD)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array().map(e => e.msg).join(', ');
      return res.status(400).json({
        error: errorMsg,
        message: errorMsg,
        errors: errors.array()
      });
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
      const errorMsg = errors.array().map(e => e.msg).join(', ');
      return res.status(400).json({
        error: errorMsg,
        message: errorMsg,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateWorkout,
  validateMeal,
  validateId
};
