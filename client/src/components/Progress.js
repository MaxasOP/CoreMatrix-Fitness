import React, { useEffect, useState } from 'react';
import api from '../api';

const weekPlan = [
  { day: 'Monday',    group: 'PUSH' },
  { day: 'Tuesday',   group: 'PULL' },
  { day: 'Wednesday', group: 'REST' },
  { day: 'Thursday',  group: 'LEGS' },
  { day: 'Friday',    group: 'PUSH' },
  { day: 'Saturday',  group: 'PULL' },
  { day: 'Sunday',    group: 'REST' },
];

export default function Progress() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    try { const res = await api.get('/workouts'); setWorkouts(res.data || []); } catch (err) { console.warn(err); }
  }

  // compute simple weekly completion based on presence of workouts per day
  function computeWeekly() {
    // map dates to day names
    const daysWithWorkout = new Set(workouts.map(w => {
      const d = w.date || (w.log_date && w.log_date.split && w.log_date.split('T')[0]) || new Date().toISOString().split('T')[0];
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { weekday: 'long' });
    }));

    return weekPlan.map(p => ({ ...p, done: daysWithWorkout.has(p.day) }));
  }

  const weekly = computeWeekly();
  const completed = weekly.filter(d => d.done && d.group !== 'REST').length;
  const weekProgress = Math.round((completed / 5) * 100);

  return (
    <div style={{ padding: 20 }}>
      <h2>Progress</h2>
      <div>Weekly completion: <strong>{weekProgress}%</strong></div>
      <div style={{ marginTop: 12 }}>
        {weekly.map(d => (
          <div key={d.day} style={{ padding: 6, borderBottom: '1px solid #eee' }}>{d.day}: {d.group} {d.done ? '✅' : '—'}</div>
        ))}
      </div>
    </div>
  );
}
