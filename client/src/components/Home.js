// Cache-busting comment to force Vercel to rebuild this file
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { ReactComponent as StrongArmIcon } from '../assets/strong-arm.svg';
import { ReactComponent as DumbbellIcon } from '../assets/dumbbell.svg'; // Import the SVG

const defaultWeekPlan = [
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

function toDateKey(value) {
  const dt = parseLocalDate(value);
  if (!dt) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getItemDate(item) {
  if (!item) return null;
  if (item.date) return toDateKey(item.date);
  if (item.log_date) return toDateKey(item.log_date);
  return null;
}

function getItemDayIndex(item) {
  if (!item) return null;
  const dt = parseLocalDate(item.date || item.log_date);
  return dt ? dt.getDay() : null;
}

function computeStreak(items) {
  const dates = new Set(items.map(getItemDate).filter(Boolean));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = toDateKey(cursor);
    if (!key || !dates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tip, setTip] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      setError('We had trouble loading your dashboard. Please check your connection or try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }

  function getTodayStats() {
    const today = toDateKey(new Date());
    const safeMeals = Array.isArray(meals) ? meals : [];
    const safeWorkouts = Array.isArray(workouts) ? workouts : [];
    const todayMeals = safeMeals.filter(m => getItemDate(m) === today);
    const todayWorkouts = safeWorkouts.filter(w => getItemDate(w) === today);
    return {
      calories: todayMeals.reduce((s,m)=>s + (Number(m.calories)||0), 0),
      protein:  todayMeals.reduce((s,m)=>s + (Number(m.protein)||0), 0),
      workouts: todayWorkouts.length,
      totalSets: todayWorkouts.reduce((s,w)=>s + (Number(w.sets)||0), 0)
    };
  }

  const stats = getTodayStats();
  const recentWorkouts = Array.isArray(workouts) ? workouts.slice(0, 5) : [];
  const daysWithWorkout = new Set(workouts.map(getItemDayIndex).filter(d => d !== null));
  const completedDays = defaultWeekPlan.filter(d => d.group !== 'REST' && daysWithWorkout.has(d.dayIndex)).length;
  const weekProgress = Math.round((completedDays / 5) * 100);
  const streak = computeStreak(workouts);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-pulse cursor-wait">
        <section className="card p-6 h-64 bg-black/5 border-transparent"></section>
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card p-4 h-24 bg-black/5 border-transparent"></div>)}
        </section>
        <section className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card p-5 h-48 bg-black/5 border-transparent"></div>)}
        </section>
        <section className="card p-5 h-40 bg-black/5 border-transparent"></section>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {error && (
        <div className="card p-4" style={{ borderColor: 'rgba(255,90,31,0.4)' }}>
          <div className="tag">Heads up</div>
          <div className="mt-2">{error}</div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 sm:p-10 lg:p-12 text-white shadow-[0_20px_50px_rgba(255,90,31,0.15)] reveal group" style={{ '--d': '0.05s' }}>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,90,31,0.2),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 text-white opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-1000 ease-out pointer-events-none">
          <StrongArmIcon className="w-[400px] h-[400px]" />
        </div>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-gray-300 tracking-wider uppercase mb-4 shadow-sm">Today is a good day</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff5a1f] via-pink-400 to-orange-400 animate-gradient-x">
              {user ? `Welcome back, ${user.name} 👋` : 'Build power, not excuses.'}
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl leading-relaxed">Track your lifts, fuel your performance, and see real progress. This dashboard is built for daily wins.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/forge" className="bg-gradient-to-r from-[#ff5a1f] to-orange-500 hover:from-orange-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95">Log workout</Link>
              <Link to="/fuel" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95">Log meal</Link>
              {!user && <Link to="/auth" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95">Create account</Link>}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-sm flex items-center gap-2 shadow-inner"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Goal: {user?.goal || 'Build strength'}</span>
              <span className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-sm flex items-center gap-2 shadow-inner"><svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg> Streak: <strong className={streak > 0 ? "text-orange-400 animate-pulse" : ""}>{streak} {streak > 0 ? '🔥' : '💤'}</strong></span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal group" style={{ '--d': '0.1s' }}>
          <div className="flex items-center gap-3 muted font-medium text-sm">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" /></svg></div> Calories
          </div>
          <div className="text-3xl font-extrabold mt-3">{stats.calories}</div>
          <div className="muted text-sm">from meals today</div>
        </div>
        <div className="card hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal group" style={{ '--d': '0.15s' }}>
          <div className="flex items-center gap-3 muted font-medium text-sm">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div> Protein
          </div>
          <div className="text-3xl font-extrabold mt-3">{stats.protein}g</div>
          <div className="muted text-sm">muscle repair fuel</div>
        </div>
        <div className="card hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal group" style={{ '--d': '0.2s' }}>
          <div className="flex items-center gap-3 muted font-medium text-sm">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div> Workouts
          </div>
          <div className="text-3xl font-extrabold mt-3">{stats.workouts}</div>
          <div className="muted text-sm">sessions today</div>
        </div>
        <div className="card hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal group" style={{ '--d': '0.25s' }}>
          <div className="flex items-center gap-3 muted font-medium text-sm">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div> Total sets
          </div>
          <div className="text-3xl font-extrabold mt-3">{stats.totalSets}</div>
          <div className="muted text-sm">volume logged</div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal" style={{ '--d': '0.3s' }}>
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Weekly progress</div>
          <div className="text-4xl font-extrabold text-gray-900">{weekProgress}%</div>
          <div className="muted text-sm">{completedDays} of 5 training days</div>
          <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#ff5a1f] via-pink-500 to-orange-400 animate-gradient-x rounded-full transition-all duration-1000" style={{ width: `${weekProgress}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {defaultWeekPlan.map(d => (
              <div key={d.day} className="flex flex-col gap-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <span className={`font-semibold ${daysWithWorkout.has(d.dayIndex) ? 'text-[#ff5a1f]' : 'text-gray-400'}`}>{d.day.slice(0,3)}</span>
                <span className="text-xs text-gray-500">{d.group}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card relative overflow-hidden bg-[#ff5a1f] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal group" style={{ '--d': '0.35s' }}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-transform duration-500">
            <svg width="150" height="150" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          </div>
          <div className="relative z-10">
            <div className="font-semibold uppercase tracking-wide text-xs mb-2 text-white/80">Daily tip</div>
            <div className="text-xl font-medium leading-relaxed">{tip || 'Power comes from consistency, not perfection.'}</div>
          </div>
        </div>

        <div className="card hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 group-hover:scale-105 active:scale-95 transition-all duration-300 reveal" style={{ '--d': '0.4s' }}>
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Fuel snapshot</div>
          <div className="text-4xl font-extrabold text-gray-900">{stats.calories} <span className="text-lg text-gray-400 font-medium">kcal</span></div>
          <div className="muted text-sm">today's intake</div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Protein</span>
              <strong className="text-gray-900">{stats.protein}g</strong>
            </div>
            <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 animate-gradient-x rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.protein)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card reveal" style={{ '--d': '0.45s' }}>
        <h3 className="text-xl font-bold text-gray-900">Recent workouts</h3>
        {recentWorkouts.length === 0 ? (
          <div className="card-soft py-10 mt-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-3 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-inner">
              <DumbbellIcon className="w-8 h-8" />
            </div>
            <div className="text-gray-900 font-extrabold text-base">No workouts yet</div>
            <div className="muted mt-1 text-sm">Start by building your first routine in Workout!</div>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentWorkouts.map(w => (
              <li key={w._id || w.id} className="card-soft flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/80 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm group-hover:text-[#ff5a1f] transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg></div>
                  <div>
                    <div className="font-semibold text-gray-900">{w.name}</div>
                    <div className="text-gray-500 text-sm mt-0.5">{w.category} • <span className="font-medium">{w.sets}</span> sets × <span className="font-medium">{w.reps}</span> reps</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm mt-2 sm:mt-0 font-medium bg-gray-100 px-3 py-1 rounded-md self-start sm:self-auto">{new Date(w.log_date).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
