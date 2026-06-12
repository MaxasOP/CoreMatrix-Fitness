// Cache-busting comment to force Vercel to rebuild this file
import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

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
  useDocumentMetadata({
    title: 'Weekly Fitness Progress',
    description: 'View your weekly workout completion rates, body metric logs, and top exercise categories.'
  });
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
      <section className="card p-6">
        <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Consistency</div>
        <h1 className="text-3xl font-extrabold text-gray-900">Weekly progress</h1>
        <div className="mt-4 text-6xl font-black flex items-center gap-4"><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x">{weekProgress}%</span> {weekProgress === 100 && <span className="text-5xl animate-bounce">🏆</span>}</div>
        <div className="text-gray-500 font-medium mt-1">{completed} training days completed</div>
        <div className="h-3 bg-gray-100 rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 animate-gradient-x rounded-full transition-all duration-1000" style={{ width: `${weekProgress}%` }} />
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {weekly.map(d => (
            <div key={d.day} className={`card-soft ${d.done && d.group !== 'REST' ? 'bg-indigo-50/50 border-indigo-200 shadow-inner' : ''} flex flex-col gap-1`}>
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
        <div className="card p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
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

        <div className="card p-6 md:col-span-2 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Focus areas</div>
          <h3 className="text-2xl font-bold text-gray-900">Top categories</h3>
          {topCategories.length === 0 ? (
            <div className="card-soft py-10 mt-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-3 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div className="text-gray-900 font-extrabold text-base">No analytics yet</div>
              <div className="muted mt-1 text-sm">Start logging workouts to see patterns.</div>
            </div>
          ) : (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="card-soft p-5 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all">
                  <div className="font-bold text-gray-900 text-lg">{cat}</div>
                  <div className="text-gray-500 text-sm font-medium mt-1">{count} session{count !== 1 ? 's' : ''}</div>
                  <div className="h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ff5a1f] to-orange-400 animate-gradient-x rounded-full" style={{ width: `${Math.min(100, count * 12)}%` }} />
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
