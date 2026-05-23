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
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      {error && <div style={{ marginBottom: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fcd34d', padding: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ padding: 12, border: '1px solid #ddd' }}>
          <h4>Today</h4>
          <div>Calories: <strong>{stats.calories}</strong></div>
          <div>Protein: <strong>{stats.protein}g</strong></div>
          <div>Workouts: <strong>{stats.workouts}</strong></div>
          <div>Total sets: <strong>{stats.totalSets}</strong></div>
        </div>
        <div style={{ padding: 12, border: '1px solid #ddd' }}>
          <h4>Weekly Plan Progress</h4>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>{weekProgress}%</div>
              <div style={{ fontSize: 12 }}>weekly</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 12, border: '1px solid #ddd', flex: 1 }}>
          <h4>Daily Tip</h4>
          <div>{tip}</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Recent Workouts</h4>
        <ul>
          {recentWorkouts.map(w => <li key={w._id || w.id}>{w.name} — {w.category} — {w.sets}×{w.reps}</li>)}
        </ul>
      </div>
    </div>
  );
}
