import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';

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
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Consistency</div>
        <h2 className="text-3xl font-extrabold text-gray-900">Weekly progress</h2>
        <div className="mt-4 text-5xl font-black text-gray-900">{weekProgress}%</div>
        <div className="text-gray-500 font-medium mt-1">{completed} training days completed</div>
        <div className="h-3 bg-gray-100 rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${weekProgress}%` }} />
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {weekly.map(d => (
            <div key={d.day} className={`p-4 rounded-xl border ${d.done && d.group !== 'REST' ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'} flex flex-col gap-1`}>
              <div className="flex items-center justify-between">
                <div className={`font-semibold ${d.done && d.group !== 'REST' ? 'text-indigo-900' : 'text-gray-900'}`}>{d.day}</div>
                {d.done && d.group !== 'REST' && <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div className={`text-sm ${d.done && d.group !== 'REST' ? 'text-indigo-600' : 'text-gray-500'}`}>{d.group} • {d.done ? 'Done' : 'Rest'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Profile</div>
          <h3 className="text-2xl font-bold text-gray-900">Your metrics</h3>
          {user ? (
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Goal</span><strong className="text-gray-900 capitalize">{user.goal}</strong></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Weight</span><strong className="text-gray-900">{user.weight || user.weight_kg || '-'} kg</strong></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Calories</span><strong className="text-gray-900">{user.calorieGoal || user.calorie_goal || '-'} kcal</strong></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Protein</span><strong className="text-gray-900">{user.proteinGoal || user.protein_goal || '-'} g</strong></div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-sm">Sign in to see your profile metrics.</div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Focus areas</div>
          <h3 className="text-2xl font-bold text-gray-900">Top categories</h3>
          {topCategories.length === 0 ? (
            <div className="mt-4 p-6 text-center rounded-xl bg-gray-50 border border-gray-100 text-gray-500">No workouts yet. Start logging to see patterns.</div>
          ) : (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="font-bold text-gray-900 text-lg">{cat}</div>
                  <div className="text-gray-500 text-sm font-medium mt-1">{count} session{count !== 1 ? 's' : ''}</div>
                  <div className="h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-[#ff5a1f] rounded-full" style={{ width: `${Math.min(100, count * 12)}%` }} />
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
