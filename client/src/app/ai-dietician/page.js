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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Meal Plan</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Breakfast</h3>
                  <p className="text-gray-700">{mealPlan.breakfast}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lunch</h3>
                  <p className="text-gray-700">{mealPlan.lunch}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dinner</h3>
                  <p className="text-gray-700">{mealPlan.dinner}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Snacks</h3>
                  <p className="text-gray-700">{mealPlan.snacks}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Macro Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="text-2xl font-bold text-blue-600">{mealPlan.macros?.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="text-2xl font-bold text-green-600">{mealPlan.macros?.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fats</p>
                      <p className="text-2xl font-bold text-orange-600">{mealPlan.macros?.fats}g</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Cost Estimate</p>
                  <p className="text-2xl font-bold text-green-600">₹{mealPlan.monthly_cost}</p>
                </div>
              </div>
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
