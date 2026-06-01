// backend/controllers/analyticsController.js
// User analytics and insights
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get last 7 days workouts
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkouts = await Workout.find({
      user_id: userId,
      created_at: { $gte: sevenDaysAgo }
    });

    // Get last 7 days meals
    const recentMeals = await Meal.find({
      user_id: userId,
      created_at: { $gte: sevenDaysAgo }
    });

    const analytics = {
      user_name: user.name,
      period: 'Last 7 days',
      workouts: {
        count: recentWorkouts.length,
        average_per_day: (recentWorkouts.length / 7).toFixed(2),
        total_duration: recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        exercises: [...new Set(recentWorkouts.map(w => w.exercise_name))]
      },
      nutrition: {
        meals_count: recentMeals.length,
        average_per_day: (recentMeals.length / 7).toFixed(2),
        total_calories: recentMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
        macros: {
          protein: recentMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
          carbs: recentMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
          fats: recentMeals.reduce((sum, m) => sum + (m.fats || 0), 0)
        }
      },
      health_metrics: {
        current_health_score: user.health_scores?.overall_health_score || 0,
        streak: user.current_workout_streak,
        weight_change: user.weight_tracking?.latest_weight - user.weight_tracking?.initial_weight,
        bmi: user.bmi
      }
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMilestones = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const milestones = {
      completed: [],
      next_targets: []
    };

    // Completed milestones
    if (user.current_workout_streak >= 7) {
      milestones.completed.push('🏆 1-Week Streak Warrior');
    }
    if (user.current_workout_streak >= 30) {
      milestones.completed.push('🏆 Month Dedication Champion');
    }
    if (user.current_workout_streak >= 100) {
      milestones.completed.push('🏆 Century Champion');
    }

    // Next targets
    milestones.next_targets.push({
      target: `${30 - (user.current_workout_streak % 30)} days to monthly achievement`,
      current_progress: user.current_workout_streak % 30
    });

    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProgressTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Workout frequency trend
    const workoutTrend = await Workout.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(userId),
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      workout_frequency: workoutTrend,
      period_days: 30
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
