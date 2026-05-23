import React, { useEffect, useState } from 'react';
import api from '../api';

const defaultWeekPlan = [
  { day: 'Monday',    group: 'PUSH' },
  { day: 'Tuesday',   group: 'PULL' },
  { day: 'Wednesday', group: 'REST' },
  { day: 'Thursday',  group: 'LEGS' },
  { day: 'Friday',    group: 'PUSH' },
  { day: 'Saturday',  group: 'PULL' },
  { day: 'Sunday',    group: 'REST' },
];

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tip, setTip] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [wRes, mRes, tRes] = await Promise.all([api.get('/workouts'), api.get('/meals'), api.get('/tip')]);
      setWorkouts(Array.isArray(wRes.data) ? wRes.data : []);
      setMeals(Array.isArray(mRes.data) ? mRes.data : []);
      setTip((tRes.data && tRes.data.tip) || '');
      setError('');
    } catch (err) {
      console.warn('Home fetch error', err);
      setError('Dashboard data could not be loaded. Check REACT_APP_API_URL in Vercel and make sure it points to the Render backend.');
    }
  }

  function getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const safeMeals = Array.isArray(meals) ? meals : [];
    const safeWorkouts = Array.isArray(workouts) ? workouts : [];
    const todayMeals = safeMeals.filter(m => (m.date || (m.log_date && m.log_date.split && m.log_date.split('T')[0])) === today || (m.log_date && new Date(m.log_date).toISOString().split('T')[0] === today));
    const todayWorkouts = safeWorkouts.filter(w => (w.date || (w.log_date && w.log_date.split && w.log_date.split('T')[0])) === today || (w.log_date && new Date(w.log_date).toISOString().split('T')[0] === today));
    return {
      calories: todayMeals.reduce((s,m)=>s + (Number(m.calories)||0), 0),
      protein:  todayMeals.reduce((s,m)=>s + (Number(m.protein)||0), 0),
      workouts: todayWorkouts.length,
      totalSets: todayWorkouts.reduce((s,w)=>s + (Number(w.sets)||0), 0)
    };
  }

  const stats = getTodayStats();
  const recentWorkouts = Array.isArray(workouts) ? workouts.slice(0, 5) : [];

  const completedDays = defaultWeekPlan.filter(d => d.group !== 'REST').length;
  const weekProgress = Math.round((completedDays / 5) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-6">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm muted">Today</div>
            <div className="stat-num">{stats.calories} kcal</div>
            <div className="text-sm muted">Protein: <strong>{stats.protein}g</strong></div>
          </div>
          <div className="floaty p-3 card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm muted">Weekly Progress</div>
        <div className="mt-3 flex items-center gap-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center card">
            <div className="text-xl font-bold">{weekProgress}%</div>
          </div>
          <div className="flex-1">
            <div className="text-sm muted">{completedDays} active days</div>
            <div className="h-2 bg-white/10 rounded mt-2">
              <div className="h-2 accent-fill rounded" style={{ width: `${weekProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm muted">Daily Tip</div>
        <div className="mt-3 text-lg">{tip || 'Keep the tempo — small wins compound.'}</div>
      </div>

      <section className="md:col-span-2 card p-5">
        <h3 className="text-lg font-semibold">Recent Workouts</h3>
        <ul className="mt-3 divide-y divide-white/6">
          {recentWorkouts.map(w => (
            <li key={w._id || w.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{w.name}</div>
                <div className="text-sm muted">{w.category} — {w.sets}×{w.reps}</div>
              </div>
              <div className="text-sm muted">{new Date(w.log_date).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
