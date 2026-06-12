import React, { useState } from 'react';
import axios from 'axios';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

const AIWorkout = () => {
  useDocumentMetadata({
    title: 'AI Workout Planner',
    description: 'Generate custom, goal-oriented workout routines tailored to your target muscles, equipment, and experience.'
  });

  const [formData, setFormData] = useState({
    experience_level: 'beginner',
    days_per_week: 4,
    equipment_available: 'full_gym'
  });
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ai/workout-plan`,
        {
          experience_level: formData.experience_level,
          days_per_week: Number(formData.days_per_week),
          equipment_available: formData.equipment_available
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkoutPlan(response.data.workoutPlan);
    } catch (error) {
      console.error('Error:', error);
      const msg = error?.response?.data?.error || error?.message || 'Error generating workout plan';
      alert(msg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Workout Planner</h1>
        <p className="text-gray-600 mb-8">Generate a custom routine tailored to your equipment and schedule.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 h-fit lg:sticky top-24">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Experience Level</label>
                <select
                  id="workout-experience-level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#ff5a1f] focus:border-transparent outline-none transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Days Per Week</label>
                <input
                  id="workout-days-per-week"
                  type="number"
                  name="days_per_week"
                  min="1"
                  max="7"
                  value={formData.days_per_week}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#ff5a1f] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Available Equipment</label>
                <select
                  id="workout-equipment-available"
                  name="equipment_available"
                  value={formData.equipment_available}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-[#ff5a1f] focus:border-transparent outline-none transition-all"
                >
                  <option value="full_gym">Full Gym</option>
                  <option value="dumbbells_only">Dumbbells Only</option>
                  <option value="bodyweight">Bodyweight / No Equipment</option>
                  <option value="resistance_bands">Resistance Bands</option>
                </select>
              </div>

              <button
                id="btn-workout-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-[#ff5a1f] to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-60"
              >
                {loading ? 'Consulting AI...' : 'Generate Plan'}
              </button>
            </form>
          </div>

          {/* Plan Display */}
          <div className="lg:col-span-2 space-y-6">
            {workoutPlan ? (
              <>
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#ff5a1f]">
                  <h2 className="text-2xl font-bold text-gray-900">{workoutPlan.plan_name}</h2>
                  <p className="text-gray-600 mt-1 font-medium">{workoutPlan.goal_focus} • {workoutPlan.days_per_week} Days/Week</p>
                </div>

                {workoutPlan.weekly_routine?.map((day, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-orange-100 text-[#ff5a1f] font-bold px-3 py-1 rounded-lg text-sm">{day.day}</span>
                      <h3 className="text-lg font-bold text-gray-900">{day.target_muscle_group}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {day.exercises?.map((exercise, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-900">{exercise.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{exercise.notes}</p>
                          </div>
                          <div className="flex gap-4 mt-3 sm:mt-0 text-sm font-semibold">
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                              <span className="text-gray-400 mr-1">Sets</span>{exercise.sets}
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                              <span className="text-gray-400 mr-1">Reps</span>{exercise.reps}
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                              <span className="text-gray-400 mr-1">Rest</span>{exercise.rest_seconds}s
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                <p className="text-lg font-medium">Your personalized workout plan will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkout;