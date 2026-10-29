const express = require('express');
const router = express.Router();
const { authOptional: authMiddleware, authRequired } = require('../middleware/authMiddleware'); // Import authRequired
const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const WorkoutPlan = require('../models/WorkoutPlan');
const aiService = require('../services/aiService');
const Workout = require('../models/Workout');
const FormAnalysis = require('../models/FormAnalysis');
const { recommendExercise } = require('../services/trainingCoach');

router.get('/training-coach', authRequired, async (req, res) => {
  try {
    const workouts = await Workout.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(100).lean();
    const analyses = await FormAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
    const seen = new Set();
    const recommendations = workouts.filter(workout => {
      const name = workout.name.trim().toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    }).map(workout => ({ name: workout.name, workoutId: workout._id, ...recommendExercise(workout, analyses.find(item => String(item.workoutId) === String(workout._id))) }));
    res.json({ recommendations });
  } catch (error) { res.status(500).json({ error: 'Training guidance could not be loaded.' }); }
});

router.post('/workout-plan/next-cycle', authRequired, async (req, res) => {
  try {
    const current = await WorkoutPlan.findOne({ userId: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    const routine = current?.plan?.weekly_routine || [];
    if (!routine.length || routine.some((day, index) => day.exercises?.length && !current.sessions.some(session => session.dayIndex === index))) return res.status(409).json({ error: 'Finish every training session before starting the next cycle.' });
    const logs = await Workout.find({ user_id: req.user.id, plan_id: current._id }).sort({ created_at: -1 }).lean();
    const analyses = await FormAnalysis.find({ userId: req.user.id, workoutId: { $in: logs.map(item => item._id) } }).sort({ createdAt: -1 }).lean();
    const nextRoutine = routine.map(day => ({ ...day, exercises: (day.exercises || []).map(exercise => {
      const log = logs.find(item => item.name.trim().toLowerCase() === exercise.name.trim().toLowerCase());
      const advice = recommendExercise(log, analyses.find(item => String(item.workoutId) === String(log?._id)));
      return { ...exercise, ...(advice.reps ? { reps: advice.reps } : {}), notes: advice.reason };
    }) }));
    // Claim the active cycle first so repeated clicks cannot create multiple successors.
    const claimed = await WorkoutPlan.findOneAndUpdate({ _id: current._id, userId: req.user.id, status: 'active' }, { $set: { status: 'archived' } });
    if (!claimed) return res.status(409).json({ error: 'This cycle has already been advanced. Refresh your plan.' });
    try {
      const next = await WorkoutPlan.create({ userId: req.user.id, preferences: current.preferences, plan: { ...current.plan, weekly_routine: nextRoutine } });
      res.status(201).json({ planId: next._id });
    } catch (error) { await WorkoutPlan.updateOne({ _id: current._id }, { $set: { status: 'active' } }); throw error; }
  } catch (error) { res.status(500).json({ error: 'The next cycle could not be saved. Try again.' }); }
});

router.post('/workout-plan/complete-day', authRequired, async (req, res) => {
  try {
    const dayIndex = Number(req.body.dayIndex);
    const plan = await WorkoutPlan.findOne({ userId: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    const day = Number.isInteger(dayIndex) && plan?.plan?.weekly_routine?.[dayIndex];
    if (!day?.exercises?.length) return res.status(400).json({ error: 'Choose a training day with exercises.' });
    const entries = day.exercises.map((_exercise, exerciseIndex) => plan.progress.find(item => item.dayIndex === dayIndex && item.exerciseIndex === exerciseIndex));
    if (entries.some(item => !item)) return res.status(409).json({ error: 'Log every planned exercise before finishing this session.' });
    const logs = await Workout.find({ _id: { $in: entries.map(item => item.workoutId) }, user_id: req.user.id }).lean();
    if (logs.length !== entries.length) return res.status(409).json({ error: 'A session log is missing. Refresh and log the missing exercise.' });
    const summary = { dayIndex, exerciseCount: logs.length, totalSets: logs.reduce((sum, item) => sum + (Number(item.sets) || 0), 0), completedAt: new Date() };
    await WorkoutPlan.updateOne({ _id: plan._id, userId: req.user.id, 'sessions.dayIndex': { $ne: dayIndex } }, { $push: { sessions: summary }, $set: { updatedAt: new Date() } });
    res.json({ session: plan.sessions?.find(item => item.dayIndex === dayIndex) || summary });
  } catch (error) { res.status(500).json({ error: 'The session could not be finished. Try again.' }); }
});

/**
 * POST /api/ai/meal-plan
 * Generate personalized meal plan
 */
router.post('/meal-plan', authMiddleware, async (req, res) => {
  try {
    // TEMP: allow AI generation without login.
    // If token is missing/invalid, generate a generic plan using fallback values.
    const userId = req.user?.id;
    if (!userId) {
      const mealPlanData = await aiService.generateMealPlan({
        age: 30,
        weight_kg: 75,
        height_cm: 175,
        activity_level: 'moderate',
        goal: 'maintenance',
        budget_monthly: 5000,
        diet_preference: 'vegetarian'
      });
      return res.status(201).json({
        message: 'Meal plan generated successfully (guest)',
        workoutPlan: undefined,
        mealPlan: mealPlanData,
        // keep existing clients happy by returning mealPlan shape
        ...mealPlanData
      });
    }


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate meal plan using AI
    const mealPlanData = await aiService.generateMealPlan({
      age: user.age_years,
      weight_kg: user.weight_kg,
      height_cm: user.height_cm,
      activity_level: user.activity_level,
      goal: user.goal,
      budget_monthly: user.budget_monthly,
      diet_preference: user.diet_preference
    });

    // Save meal plan to database
    const mealPlan = new MealPlan({
      user_id: userId,
      name: `${user.goal} Plan - ${user.calorie_goal || 2000} calories`,
      goal: user.goal,
      diet_preference: user.diet_preference,
      budget: user.budget_monthly,
      calorie_target: user.calorie_goal,
      target_protein: mealPlanData.daily_macros?.protein || 0,
      target_carbs: mealPlanData.daily_macros?.carbs || 0,
      target_fat: mealPlanData.daily_macros?.fat || 0,
      breakfast: mealPlanData.breakfast,
      lunch: mealPlanData.lunch,
      dinner: mealPlanData.dinner,
      snacks: mealPlanData.snacks,
      estimated_monthly_cost: mealPlanData.estimated_monthly_cost,
      cost_breakdown: mealPlanData.cost_breakdown,
      ai_notes: mealPlanData.nutrition_tips?.join('\n') || ''
    });

    await mealPlan.save();

    // Update user's calorie goal
    user.calorie_goal = mealPlanData.daily_macros?.calories || 2000;
    user.protein_goal = mealPlanData.daily_macros?.protein || 0;
    await user.save();

    res.status(201).json({
      message: 'Meal plan generated successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    const detail = error?.response?.data || error?.message;
    res.status(500).json({ error: 'Failed to generate meal plan', detail });
  }

});

/**
 * GET /api/ai/meal-plan/:mealPlanId
 * Get meal plan details
 */
router.get('/meal-plan/:mealPlanId', authMiddleware, async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    // Verify user owns this meal plan
    if (mealPlan.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
});

/**
 * POST /api/ai/workout-plan
 * Generate personalized workout plan
 */
router.get('/workout-plan', authRequired, async (req, res) => {
  try {
    const savedPlan = await WorkoutPlan.findOne({
      userId: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!savedPlan) {
      return res.status(404).json({ error: 'No saved workout plan' });
    }

    res.json({
      planId: savedPlan._id,
      workoutPlan: savedPlan.plan,
      preferences: savedPlan.preferences,
      progress: savedPlan.progress || [],
      sessions: savedPlan.sessions || [],
      savedAt: savedPlan.createdAt
    });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ error: 'Failed to fetch workout plan' });
  }
});

router.post('/workout-plan', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const daysPerWeek = Number(req.body.days_per_week || 4);
    if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      return res.status(400).json({ error: 'Days per week must be between 1 and 7' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate workout plan using AI
    const workoutPlanData = await aiService.generateWorkoutPlan({
      age: user.age_years,
      weight_kg: user.weight_kg,
      height_cm: user.height_cm,
      activity_level: user.activity_level,
      goal: user.goal,
      experience_level: req.body.experience_level || 'intermediate',
      days_per_week: daysPerWeek,
      equipment_available: req.body.equipment_available || 'full_gym'
    });

    const savedPlan = await WorkoutPlan.create({
      userId,
      plan: workoutPlanData,
      preferences: {
        experienceLevel: req.body.experience_level || 'intermediate',
        daysPerWeek,
        equipmentAvailable: req.body.equipment_available || 'full_gym'
      }
    });

    await WorkoutPlan.updateMany(
      { userId, status: 'active', _id: { $ne: savedPlan._id } },
      { $set: { status: 'archived' } }
    );

    res.status(201).json({
      message: 'Workout plan generated and saved',
      planId: savedPlan._id,
      workoutPlan: savedPlan.plan,
      progress: savedPlan.progress || [],
      savedAt: savedPlan.createdAt
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

/**
 * POST /api/ai/health-twin
 * Calculate health twin scores
 */
router.post('/health-twin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's workout and meal data
    const Workout = require('../models/Workout');
    const Meal = require('../models/Meal');

    const workouts = await Workout.find({ user_id: userId }).sort({ log_date: -1 }).limit(30);
    const meals = await Meal.find({ user_id: userId }).sort({ log_date: -1 }).limit(30);

    // Calculate metrics
    const workoutsPerWeek = workouts.length / 4;
    const avgCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0) / workouts.length || 0;
    const mealsLogged = meals.length;

    const healthScores = await aiService.calculateHealthTwinScores({
      age: user.age_years,
      weight_kg: user.weight_kg,
      height_cm: user.height_cm,
      workouts_per_week: workoutsPerWeek,
      sleep_hours: 7, // TODO: integrate with sleep tracking
      meals_logged: mealsLogged,
      streak_days: user.current_workout_streak,
      strength_level: 'intermediate' // TODO: calculate from workouts
    });

    // Update user's health scores
    user.health_scores = {
      fitness_age: healthScores.fitness_age,
      strength_score: healthScores.strength_score,
      recovery_score: healthScores.recovery_score,
      mobility_score: healthScores.mobility_score,
      nutrition_score: healthScores.nutrition_score,
      consistency_score: healthScores.consistency_score,
      overall_health_score: healthScores.overall_health_score,
      last_updated: new Date()
    };

    await user.save();

    res.json({
      message: 'Health twin scores calculated',
      health_scores: user.health_scores,
      recommendations: healthScores.recommendations
    });
  } catch (error) {
    console.error('Error calculating health scores:', error);
    res.status(500).json({ error: 'Failed to calculate health scores' });
  }
});

/**
 * GET /api/ai/health-twin
 * Get health twin scores for the authenticated user
 */
router.get('/health-twin', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Use req.user.id
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      health_scores: user.health_scores || {},
      message: 'Health twin scores retrieved'
    });
  } catch (error) {
    console.error('Error fetching health scores:', error);
    res.status(500).json({ error: 'Failed to fetch health scores' });
  }
});

/**
 * POST /api/ai/analyze-meal
 * Analyze restaurant meal
 */
router.post('/analyze-meal', authMiddleware, async (req, res) => {
  try {
    const { restaurant_name, dish_name } = req.body;

    if (!restaurant_name || !dish_name) {
      return res.status(400).json({ error: 'Restaurant name and dish name are required' });
    }

    const mealAnalysis = await aiService.analyzeRestaurantMeal(restaurant_name, dish_name);

    res.json({
      message: 'Meal analyzed successfully',
      analysis: mealAnalysis
    });
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({ error: 'Failed to analyze meal' });
  }
});

module.exports = router;
