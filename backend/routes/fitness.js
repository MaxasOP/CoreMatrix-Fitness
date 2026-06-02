const express = require('express');
const router = express.Router();
const controller = require('../controllers/fitnessController');
const { authRequired } = require('../middleware/authMiddleware');
const { validateWorkout, validateMeal, validateId } = require('../validation/fitnessValidation'); // Import validation middleware

// Workouts
router.get('/workouts', authRequired, controller.getAllWorkouts);
router.post('/workouts', authRequired, validateWorkout, controller.createWorkout); // Apply validateWorkout
router.put('/workouts/:id', authRequired, validateId, validateWorkout, controller.updateWorkout); // Apply validateId and validateWorkout
router.delete('/workouts/:id', authRequired, validateId, controller.deleteWorkout); // Apply validateId

// Meals
router.get('/meals', authRequired, controller.getAllMeals);
router.post('/meals', authRequired, validateMeal, controller.createMeal); // Apply validateMeal
router.put('/meals/:id', authRequired, validateId, validateMeal, controller.updateMeal); // Apply validateId and validateMeal
router.delete('/meals/:id', authRequired, validateId, controller.deleteMeal); // Apply validateId

// Tip
router.get('/tip', authRequired, controller.getDailyTip);

module.exports = router;
