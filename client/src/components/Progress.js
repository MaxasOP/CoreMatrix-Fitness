import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import bgScale from '../assets/weighing-scale-svgrepo-com.svg';
import bgBike from '../assets/stationary-bike-gym-svgrepo-com.svg';

const weekPlan = [
  { day: 'Monday',    group: 'PUSH', dayIndex: 1 },
  { day: 'Tuesday',   group: 'PULL', dayIndex: 2 },
  { day: 'Wednesday', group: 'REST', dayIndex: 3 },
  { day: 'Thursday',  group: 'LEGS', dayIndex: 4 },
  { day: 'Friday',    group: 'PUSH', dayIndex: 5 },
  { day: 'Saturday',  group: 'PULL', dayIndex: 6 },
  { day: 'Sunday',    group: 'REST', dayIndex: 0 },
];

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

export default function Progress() {
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    try { const res = await api.get('/workouts'); setWorkouts(res.data || []); } catch (err) { console.warn(err); }
  }

  // compute simple weekly completion based on presence of workouts per day
  function computeWeekly() {
    // map dates to local day indices
    const daysWithWorkout = new Set(workouts.map(w => {
      const dt = parseLocalDate(w.date || w.log_date);
      return dt ? dt.getDay() : null;
    }).filter(d => d !== null));

    return weekPlan.map(p => ({ ...p, done: daysWithWorkout.has(p.dayIndex) }));
  }

  const weekly = computeWeekly();
  const completed = weekly.filter(d => d.done && d.group !== 'REST').length;
  const weekProgress = Math.round((completed / 5) * 100);

  const categoryCounts = workouts.reduce((acc, w) => {
    const key = w.category || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="mt-6 space-y-6 page page-shell">
      <img src={bgScale} alt="" aria-hidden="true" className="bg-ornament bg-ornament--left" />
      <img src={bgBike} alt="" aria-hidden="true" className="bg-ornament bg-ornament--right" />
      <section className="card p-5">
        <div className="tag muted">Consistency</div>
        <h2 className="text-3xl">Weekly progress</h2>
        <div className="mt-2 text-4xl font-bold">{weekProgress}%</div>
        <div className="muted text-sm">{completed} training days completed</div>
        <div className="h-2 bg-black/10 rounded mt-3">
          <div className="h-2 accent-fill rounded" style={{ width: `${weekProgress}%` }} />
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {weekly.map(d => (
            <div key={d.day} className="card-soft p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.day}</div>
                <div className="muted text-sm">{d.group}</div>
              </div>
              <div className="text-sm">{d.done ? 'Done' : 'Rest'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="tag muted">Profile</div>
          <h3 className="text-2xl">Your metrics</h3>
          {user ? (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Goal</span><strong>{user.goal}</strong></div>
              <div className="flex items-center justify-between"><span>Weight</span><strong>{user.weight || user.weight_kg || '-'} kg</strong></div>
              <div className="flex items-center justify-between"><span>Calories</span><strong>{user.calorieGoal || user.calorie_goal || '-'} kcal</strong></div>
              <div className="flex items-center justify-between"><span>Protein</span><strong>{user.proteinGoal || user.protein_goal || '-'} g</strong></div>
            </div>
          ) : (
            <div className="mt-3 muted">Sign in to see your profile metrics.</div>
          )}
        </div>

        <div className="card p-5 md:col-span-2">
          <div className="tag muted">Focus areas</div>
          <h3 className="text-2xl">Top categories</h3>
          {topCategories.length === 0 ? (
            <div className="mt-3 muted">No workouts yet. Start logging to see patterns.</div>
          ) : (
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="card-soft p-4">
                  <div className="font-semibold">{cat}</div>
                  <div className="muted text-sm">{count} sessions</div>
                  <div className="h-2 bg-black/10 rounded mt-2">
                    <div className="h-2 accent-fill rounded" style={{ width: `${Math.min(100, count * 12)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
