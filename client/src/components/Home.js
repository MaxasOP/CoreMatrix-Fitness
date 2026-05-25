import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import heroAthlete from '../assets/man-lifting-weights-medium-skin-tone-svgrepo-com.svg';
import mealArt from '../assets/avocado-svgrepo-com.svg';
import bgDumbbel from '../assets/dumbbel-svgrepo-com.svg';
import bgTarget from '../assets/target-svgrepo-com.svg';

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

  return (
    <div className="mt-6 space-y-6 page page-shell">
      <img src={bgDumbbel} alt="" aria-hidden="true" className="bg-ornament bg-ornament--left" />
      <img src={bgTarget} alt="" aria-hidden="true" className="bg-ornament bg-ornament--right" />
      {error && (
        <div className="card p-4" style={{ borderColor: 'rgba(255,90,31,0.4)' }}>
          <div className="tag">Heads up</div>
          <div className="mt-2">{error}</div>
        </div>
      )}

      <section className="hero card p-6 grid md:grid-cols-2 gap-6 reveal" style={{ '--d': '0.05s' }}>
        <div>
          <div className="tag muted">Today is a good day</div>
          <h1 className="display text-4xl sm:text-5xl mt-2">{user ? `Welcome back, ${user.name}` : 'Build power, not excuses'}</h1>
          <p className="mt-3 muted">Track your lifts, fuel your performance, and see real progress. This dashboard is built for daily wins.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/forge" className="btn-primary">Log workout</Link>
            <Link to="/fuel" className="btn-secondary">Log meal</Link>
            {!user && <Link to="/auth" className="btn-secondary">Create account</Link>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip">Goal: {user?.goal || 'Build strength'}</span>
            <span className="chip">Streak: {streak} day{streak === 1 ? '' : 's'}</span>
            <span className="chip">Weekly plan: PUSH / PULL / LEGS</span>
          </div>
        </div>
        <div className="photo-card floaty">
          <img src={heroAthlete} alt="Weightlifting illustration" />
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 reveal" style={{ '--d': '0.1s' }}>
          <div className="tag muted">Calories</div>
          <div className="text-2xl font-bold mt-1">{stats.calories}</div>
          <div className="muted text-sm">from meals today</div>
        </div>
        <div className="card p-4 reveal" style={{ '--d': '0.15s' }}>
          <div className="tag muted">Protein</div>
          <div className="text-2xl font-bold mt-1">{stats.protein}g</div>
          <div className="muted text-sm">muscle repair fuel</div>
        </div>
        <div className="card p-4 reveal" style={{ '--d': '0.2s' }}>
          <div className="tag muted">Workouts</div>
          <div className="text-2xl font-bold mt-1">{stats.workouts}</div>
          <div className="muted text-sm">sessions today</div>
        </div>
        <div className="card p-4 reveal" style={{ '--d': '0.25s' }}>
          <div className="tag muted">Total sets</div>
          <div className="text-2xl font-bold mt-1">{stats.totalSets}</div>
          <div className="muted text-sm">volume logged</div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 reveal" style={{ '--d': '0.3s' }}>
          <div className="tag muted">Weekly progress</div>
          <div className="mt-2 text-3xl font-bold">{weekProgress}%</div>
          <div className="muted text-sm">{completedDays} of 5 training days</div>
          <div className="h-2 bg-black/10 rounded mt-3">
            <div className="h-2 accent-fill rounded" style={{ width: `${weekProgress}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {defaultWeekPlan.map(d => (
              <div key={d.day} className="flex items-center gap-2">
                <span className="chip" style={{ borderColor: daysWithWorkout.has(d.dayIndex) ? 'rgba(255,90,31,0.7)' : 'rgba(16,20,24,0.12)' }}>{d.day.slice(0,3)}</span>
                <span className="muted">{d.group}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 reveal" style={{ '--d': '0.35s' }}>
          <div className="tag muted">Daily tip</div>
          <div className="mt-2 text-lg">{tip || 'Power comes from consistency, not perfection.'}</div>
          <div className="mt-4 photo-card">
            <img src={mealArt} alt="Nutrition illustration" />
          </div>
        </div>

        <div className="card p-5 reveal" style={{ '--d': '0.4s' }}>
          <div className="tag muted">Fuel snapshot</div>
          <div className="mt-2 text-3xl font-bold">{stats.calories} kcal</div>
          <div className="muted text-sm">today's intake</div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Protein</span>
              <strong>{stats.protein}g</strong>
            </div>
            <div className="h-2 bg-black/10 rounded mt-2">
              <div className="h-2 accent-fill rounded" style={{ width: `${Math.min(100, stats.protein)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 reveal" style={{ '--d': '0.45s' }}>
        <h3 className="text-xl">Recent workouts</h3>
        {recentWorkouts.length === 0 ? (
          <div className="card-soft p-4 mt-3">
            <div className="muted">No workouts yet. Start with a quick entry in Forge.</div>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {recentWorkouts.map(w => (
              <li key={w._id || w.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{w.name}</div>
                  <div className="muted text-sm">{w.category} — {w.sets}x{w.reps}</div>
                </div>
                <div className="muted text-sm">{new Date(w.log_date).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
