'use client';

import React, { useState, useContext, useEffect } from 'react';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function DieticianContent() {
  const { user } = useContext(AuthContext);
  useDocumentMetadata({
    title: 'AI Dietician & Meal Planner',
    description: 'Receive personalized meal plans and nutrition guidance from our state-of-the-art AI-powered dietician.'
  });

  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activity_level: 'moderate',
    goal: 'weight_loss',
    budget: 'medium',
    diet_preference: 'vegetarian'
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || user.age_years || '',
        weight: user.weight || user.weight_kg || '',
        height: user.height || user.height_cm || '',
        activity_level: user.activityLevel || user.activity_level || 'moderate',
        goal: user.goal || 'weight_loss',
        budget: user.budget_monthly ? (user.budget_monthly < 3000 ? 'low' : user.budget_monthly < 7000 ? 'medium' : 'high') : 'medium',
        diet_preference: user.diet_preference || 'vegetarian'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(
        '/ai/meal-plan',
        {
          age: Number(formData.age),
          weight_kg: Number(formData.weight),
          height_cm: Number(formData.height),
          activity_level: formData.activity_level,
          goal: formData.goal,
          budget_monthly: formData.budget === 'low' ? 2000 : formData.budget === 'medium' ? 5000 : 8000,
          diet_preference: formData.diet_preference
        }
      );
      setMealPlan(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dietician</h1>
        <p className="text-gray-600 mb-8">Get your personalized meal plan in seconds</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  readOnly
                  className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  readOnly
                  className="mt-1 w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                <select
                  id="dietician-activity-level"
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Goal</label>
                <select
                  id="dietician-goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="health">General Health</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <select
                  id="dietician-budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Diet Preference</label>
                <select
                  id="dietician-diet-preference"
                  name="diet_preference"
                  value={formData.diet_preference}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>

              <button
                id="btn-dietician-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Meal Plan'}
              </button>
            </form>
          </div>

          {mealPlan && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">Your Personalized Meal Plan</h2>
                <p className="text-orange-100 text-sm">Tailored to your goals, preferences & budget</p>
                {mealPlan.daily_macros?.calories > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {mealPlan.daily_macros.calories} kcal/day
                    </span>
                  </div>
                )}
              </div>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 gap-4">
                {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                  const meal = mealPlan[mealKey];
                  if (!meal || !meal.meal_name) return null;
                  const mealColors = {
                    breakfast: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
                    lunch: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
                    dinner: { bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' }
                  };
                  const colors = mealColors[mealKey];
                  return (
                    <div key={mealKey} className={`${colors.bg} border ${colors.border} rounded-xl p-5 shadow-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 capitalize">{mealKey}</h3>
                        <span className={`${colors.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                          {meal.calories} kcal
                        </span>
                      </div>
                      <p className="text-gray-800 font-semibold text-base mb-1">{meal.meal_name}</p>
                      {meal.quantity && (
                        <p className="text-gray-500 text-sm mb-3">{meal.quantity}</p>
                      )}
                      <div className="flex gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <span className="text-xs text-gray-600">P: {meal.protein}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <span className="text-xs text-gray-600">C: {meal.carbs}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-xs text-gray-600">F: {meal.fat}g</span>
                        </div>
                      </div>
                      {meal.indian_alternatives && meal.indian_alternatives.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1.5">Indian Alternatives:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.indian_alternatives.map((alt, i) => (
                              <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Snacks */}
              {mealPlan.snacks && mealPlan.snacks.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🥜</span> Snacks
                  </h3>
                  <div className="space-y-2">
                    {mealPlan.snacks.map((snack, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{snack.item || snack.name || snack}</p>
                          {snack.quantity && <p className="text-xs text-gray-500">{snack.quantity}</p>}
                        </div>
                        {snack.calories > 0 && (
                          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {snack.calories} kcal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Macros Bar Chart */}
              {mealPlan.daily_macros && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Macros</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'protein', label: 'Protein', color: 'bg-red-500', bgColor: 'bg-red-100' },
                      { key: 'carbs', label: 'Carbs', color: 'bg-yellow-500', bgColor: 'bg-yellow-100' },
                      { key: 'fat', label: 'Fat', color: 'bg-blue-500', bgColor: 'bg-blue-100' }
                    ].map(({ key, label, color, bgColor }) => {
                      const value = mealPlan.daily_macros[key] || 0;
                      const total = (mealPlan.daily_macros.protein || 0) + (mealPlan.daily_macros.carbs || 0) + (mealPlan.daily_macros.fat || 0);
                      const pct = total > 0 ? (value / total) * 100 : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{label}</span>
                            <span className="text-gray-500">{value}g ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className={`w-full h-3 ${bgColor} rounded-full overflow-hidden`}>
                            <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Calories</span>
                    <span className="text-xl font-bold text-gray-900">{mealPlan.daily_macros.calories || 0} kcal</span>
                  </div>
                </div>
              )}

              {/* Cost Estimate */}
              {mealPlan.estimated_monthly_cost > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-100 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-xl">💰</span> Monthly Cost Estimate
                  </h3>
                  <p className="text-3xl font-extrabold text-emerald-600 mb-4">₹{mealPlan.estimated_monthly_cost.toLocaleString()}</p>
                  {mealPlan.cost_breakdown && (
                    <div className="grid grid-cols-2 gap-2">
                      {['breakfast', 'lunch', 'dinner', 'snacks'].map((key) => (
                        <div key={key} className="flex justify-between items-center bg-white/70 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600 capitalize">{key}</span>
                          <span className="text-sm font-semibold text-gray-800">₹{(mealPlan.cost_breakdown[key] || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Nutrition Tips */}
              {mealPlan.nutrition_tips && mealPlan.nutrition_tips.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span> Nutrition Tips
                  </h3>
                  <ul className="space-y-2">
                    {mealPlan.nutrition_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIDietician() {
  return (
    <ProtectedRoute>
      <DieticianContent />
    </ProtectedRoute>
  );
}
