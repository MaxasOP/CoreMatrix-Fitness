'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function WorkoutPlannerContent() {
  useDocumentMetadata({
    title: 'Workout Planner',
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
      const response = await api.post(
        '/ai/workout-plan',
        {
          experience_level: formData.experience_level,
          days_per_week: Number(formData.days_per_week),
          equipment_available: formData.equipment_available
        }
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative min-h-[360px] sm:min-h-[400px] md:min-h-72 overflow-hidden rounded-[28px] bg-[#11140f] mb-8 shadow-xl flex items-end">
          <Image
            src="/assets/planner-athlete.webp"
            alt="Athlete performing a cable strength exercise"
            fill
            preload
            quality={95}
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-[center_16%] sm:object-[center_20%] md:object-[center_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 md:bg-gradient-to-r md:from-black/95 md:via-black/55 md:to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-xl p-6 sm:p-8 md:p-10 text-white">
            <div className="text-lime-300 text-xs font-bold uppercase tracking-[0.18em] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" /> Built around you
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Workout Planner</h1>
            <p className="text-gray-200 text-sm sm:text-base">Set your goal, available equipment, and weekly schedule.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                className="btn-core-primary w-full mt-4 !py-3.5 !text-base"
              >
                {loading ? 'Building plan...' : 'Build plan'}
              </button>
            </form>
          </div>

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

                {workoutPlan.warmup_routine?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-lg text-sm">Warmup</span>
                      <h3 className="text-lg font-bold text-gray-900">Pre-Workout Routine</h3>
                    </div>
                    <ul className="space-y-2">
                      {workoutPlan.warmup_routine.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="text-gray-700 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workoutPlan.cooldown_routine?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-purple-100 text-purple-600 font-bold px-3 py-1 rounded-lg text-sm">Cooldown</span>
                      <h3 className="text-lg font-bold text-gray-900">Post-Workout Routine</h3>
                    </div>
                    <ul className="space-y-2">
                      {workoutPlan.cooldown_routine.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <span className="bg-purple-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="text-gray-700 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workoutPlan.expert_tips?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-[#ff5a1f]">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-orange-100 text-[#ff5a1f] font-bold px-3 py-1 rounded-lg text-sm">Expert Tips</span>
                      <h3 className="text-lg font-bold text-gray-900">Pro Advice</h3>
                    </div>
                    <div className="space-y-3">
                      {workoutPlan.expert_tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <span className="bg-[#ff5a1f] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <p className="text-gray-700 font-medium">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                <p className="text-lg font-medium">Your workout plan will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIWorkout() {
  return (
    <ProtectedRoute>
      <WorkoutPlannerContent />
    </ProtectedRoute>
  );
}
