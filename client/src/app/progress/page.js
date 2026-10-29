'use client';

import React, { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';
import TrainingGuidance from '../../components/TrainingGuidance';

const weekPlan = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => ({ day, group: 'LOG', dayIndex: (index + 1) % 7 }));

function parseLocalDate(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const y = Number(match[1]);
      const m = Number(match[2]) - 1;
      const d = Number(match[3]);
      return new Date(y, m, d);
    }
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function ProgressContent() {
  const { user } = useContext(AuthContext);
  useDocumentMetadata({
    title: 'Weekly Fitness Progress',
    description: 'View your weekly workout completion rates, body metric logs, and top exercise categories.'
  });
  const [workouts, setWorkouts] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    async function fetchWorkouts() {
      const [workoutResult, planResult, analysisResult] = await Promise.allSettled([
        api.get('/workouts'), api.get('/ai/workout-plan'), api.get('/video/history?limit=12')
      ]);
      if (workoutResult.status === 'fulfilled') setWorkouts(workoutResult.value.data || []);
      if (planResult.status === 'fulfilled') setActivePlan(planResult.value.data);
      if (analysisResult.status === 'fulfilled') setAnalyses(analysisResult.value.data || []);
    }
    fetchWorkouts();
  }, []);

  function computeWeekly() {
    if (activePlan?.workoutPlan?.weekly_routine?.length) {
      return activePlan.workoutPlan.weekly_routine.map((day, dayIndex) => {
        const exercises = day.exercises || [];
        const completedExercises = exercises.filter((_exercise, exerciseIndex) => activePlan.progress?.some(item => item.dayIndex === dayIndex && item.exerciseIndex === exerciseIndex)).length;
        return {
          day: day.day || `Day ${dayIndex + 1}`,
          group: day.target_muscle_group || 'TRAIN',
          done: exercises.length > 0 && completedExercises === exercises.length,
          completedExercises,
          exerciseCount: exercises.length
        };
      });
    }
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
    const daysWithWorkout = new Set(workouts.filter(w => new Date(w.date || w.log_date) >= weekStart).map(w => {
      const dt = parseLocalDate(w.date || w.log_date);
      return dt ? dt.getDay() : null;
    }).filter(d => d !== null));

    return weekPlan.map(p => ({ ...p, done: daysWithWorkout.has(p.dayIndex) }));
  }

  const weekly = computeWeekly();
  const completed = weekly.filter(d => d.done && d.group !== 'REST').length;
  const targetDays = Math.max(weekly.filter(d => d.group !== 'REST').length, 1);
  const weekProgress = Math.round((completed / targetDays) * 100);
  const averageFormScore = analyses.length ? Math.round(analyses.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / analyses.length) : null;

  const categoryCounts = workouts.reduce((acc, w) => {
    const key = w.category || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <TrainingGuidance />
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Consistency</div>
                <h1 className="text-3xl font-extrabold text-gray-900">Weekly progress</h1>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-gray-500">Target · {targetDays} days</span>
            </div>

            <div className="mt-4 text-6xl font-black flex items-center gap-4">
              <span className="text-lime-300">{weekProgress}%</span>
            </div>
            <div className="text-gray-500 font-medium mt-1">{activePlan ? `${completed} of ${targetDays} planned days completed` : `${completed} active days this week. Build a plan to track a training target.`}</div>
          </div>

          <div className="weekly-chart" role="img" aria-label={`${completed} of ${targetDays} planned training days completed`}>
            {weekly.map(d => (
              <div key={d.day} className={`weekly-bar ${d.done && d.group !== 'REST' ? 'is-done' : ''} ${d.group === 'REST' ? 'is-rest' : ''}`}>
                <i aria-hidden="true" />
                <strong>{d.day.slice(0, 3)}</strong>
                <span>{d.exerciseCount ? `${d.completedExercises}/${d.exerciseCount}` : d.group}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-first md:order-last bg-gray-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden group min-h-[460px] sm:min-h-[520px] md:min-h-full flex items-end">
          <Image
            src="/assets/progress-athlete.webp"
            alt="Athlete pushing sled in high-intensity training session"
            fill
            priority
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-[center_18%] sm:object-[center_20%] md:object-[center_22%] transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-40% to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-sm">
            <div className="font-semibold text-lime-300 uppercase tracking-wider text-xs mb-1.5">This week</div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{completed} training days</h3>
            <p className="text-gray-200 mt-2 text-sm leading-relaxed">Your logged exercises are measured against the active plan.</p>
            <Link href="/ai-workout" className="plan-day-action mt-4 inline-flex">Adjust plan →</Link>
          </div>
        </aside>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Profile</div>
          <h3 className="text-2xl font-bold text-gray-900">Your metrics</h3>
          {user ? (
            <dl className="metric-table">
              <div><dt>Goal</dt><dd className="capitalize">{user.goal}</dd></div>
              <div><dt>Weight</dt><dd>{user.weight || user.weight_kg || '-'} kg</dd></div>
              <div><dt>Calories</dt><dd>{user.calorieGoal || user.calorie_goal || '-'} kcal</dd></div>
              <div><dt>Protein</dt><dd>{user.proteinGoal || user.protein_goal || '-'} g</dd></div>
            </dl>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-sm">Sign in to see your profile metrics.</div>
          )}
        </div>

        <div className="card p-6 md:col-span-2 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Focus areas</div>
          <h3 className="text-2xl font-bold text-gray-900">Top categories</h3>
          {topCategories.length === 0 ? (
            <div className="py-10 mt-6 border-y border-white/10 text-center">
              <div className="text-gray-900 font-bold text-base">No category data</div>
              <div className="muted mt-1 text-sm">Logged workouts will build this chart.</div>
            </div>
          ) : (
            <div className="category-chart" role="img" aria-label="Workout sessions by category">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="category-row">
                  <strong>{cat}</strong>
                  <div className="category-track"><i style={{ width: `${Math.min(100, count * 12)}%` }} /></div>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="form-trend-section" aria-labelledby="form-trend-title">
        <div className="section-heading"><div><p className="eyebrow">Technique</p><h2 id="form-trend-title">Form review history</h2></div><Link href="/form-analysis">Analyze a set</Link></div>
        {analyses.length ? (
          <>
            <div className="form-score-summary"><strong>{averageFormScore}</strong><span>average score<br />across {analyses.length} reviews</span></div>
            <div className="form-score-chart" role="img" aria-label={`Recent form scores averaging ${averageFormScore} out of 100`}>
              {[...analyses].reverse().map(item => <i key={item._id} style={{ height: `${Math.max(8, item.score || 0)}%` }} title={`${item.exercise}: ${item.score}`} />)}
            </div>
            <div className="form-review-table" role="table" aria-label="Recent form reviews">
              {analyses.slice(0, 5).map(item => <div role="row" key={item._id}><strong role="cell">{item.exercise}</strong><span role="cell">{item.score}/100</span><time role="cell">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></div>)}
            </div>
          </>
        ) : <div className="empty-state"><strong>No form reviews yet.</strong><span>Analyze a working set to establish a technique baseline.</span></div>}
      </section>
    </div>
  );
}

export default function Progress() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}
