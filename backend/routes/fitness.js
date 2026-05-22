const express = require('express');
const router = express.Router();
const controller = require('../controllers/fitnessController');

// Workouts
router.get('/workouts', controller.getAllWorkouts);
router.post('/workouts', controller.createWorkout);
router.put('/workouts/:id', controller.updateWorkout);
router.delete('/workouts/:id', controller.deleteWorkout);

// Meals
router.get('/meals', controller.getAllMeals);
router.post('/meals', controller.createMeal);
router.put('/meals/:id', controller.updateMeal);
router.delete('/meals/:id', controller.deleteMeal);

// Tip
router.get('/tip', controller.getDailyTip);

module.exports = router;
