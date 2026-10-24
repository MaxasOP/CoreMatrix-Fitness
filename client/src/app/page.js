'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '../api';
import { AuthContext } from '../AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dateKey = value => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

function Stat({ value, label, detail }) {
  return <div className="metric-card"><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function Home() {
  const { user, authLoading } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tip, setTip] = useState('Train with intent. Recover with the same discipline.');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentMetadata({ title: 'Dashboard', description: 'Your focused daily fitness command center.' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    Promise.all([api.get('/workouts'), api.get('/meals'), api.get('/tip')])
      .then(([workoutResponse, mealResponse, tipResponse]) => {
        setWorkouts(Array.isArray(workoutResponse.data) ? workoutResponse.data : []);
        setMeals(Array.isArray(mealResponse.data) ? mealResponse.data : []);
        setTip(currentTip => tipResponse.data?.tip || currentTip);
      })
      .catch(() => setError('Your live data is unavailable right now.'))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  const summary = useMemo(() => {
    const today = dateKey();
    const todaysMeals = meals.filter(item => dateKey(item.date || item.log_date) === today);
    const todaysWorkouts = workouts.filter(item => dateKey(item.date || item.log_date) === today);
    const activeDays = new Set(workouts.map(item => {
      const value = new Date(item.date || item.log_date);
      return Number.isNaN(value.getTime()) ? null : (value.getDay() + 6) % 7;
    }).filter(value => value !== null));
    return {
      calories: todaysMeals.reduce((sum, item) => sum + (Number(item.calories) || 0), 0),
      protein: todaysMeals.reduce((sum, item) => sum + (Number(item.protein) || 0), 0),
      sessions: todaysWorkouts.length,
      activeDays,
    };
  }, [meals, workouts]);

  if (authLoading || (user && loading)) return <main className="dashboard-shell"><div className="dashboard-loading" aria-label="Loading dashboard" /></main>;

  return (
    <main className="dashboard-shell">
      <section className="command-hero">
        <div>
          <p className="eyebrow">Daily command center</p>
          <h1>{user ? `Ready, ${user.name.split(' ')[0]}?` : 'Make today count.'}</h1>
          <p className="hero-copy">One clear view of your training and nutrition. No noise, just the next useful move.</p>
          <div className="hero-actions"><Link href="/forge" className="action-primary">Start workout <span>→</span></Link><Link href="/fuel" className="action-secondary">Log a meal</Link></div>
        </div>
        <div className="today-score" aria-label="Weekly training progress"><span>This week</span><strong>{summary.activeDays.size}<small>/7</small></strong><p>active days</p></div>
      </section>

      {error && <div className="status-note">{error} You can still explore the app.</div>}

      <section className="metrics-grid" aria-label="Today's summary">
        <Stat value={summary.sessions} label="Sessions" detail="completed today" />
        <Stat value={summary.calories.toLocaleString()} label="Energy" detail="kcal logged" />
        <Stat value={`${summary.protein}g`} label="Protein" detail="toward recovery" />
      </section>

      <section className="dashboard-grid">
        <article className="focus-card">
          <div className="section-heading"><div><p className="eyebrow">Rhythm</p><h2>Your training week</h2></div><Link href="/progress">View progress</Link></div>
          <div className="week-strip">{week.map((day, index) => <div className={summary.activeDays.has(index) ? 'day active' : 'day'} key={day}><span>{day}</span><i /></div>)}</div>
          <div className="insight-row"><span className="insight-mark">CM</span><p><strong>Coach note</strong>{tip}</p></div>
        </article>

        <aside className="quick-card">
          <p className="eyebrow">Next actions</p><h2>Keep momentum</h2>
          <Link href="/ai-workout"><span>Build a plan</span><small>AI workout planner</small><b>↗</b></Link>
          <Link href="/ai-dietician"><span>Plan nutrition</span><small>Personalised meals</small><b>↗</b></Link>
          <Link href="/form-analysis"><span>Check your form</span><small>Video movement analysis</small><b>↗</b></Link>
        </aside>
      </section>

      <section className="recent-card">
        <div className="section-heading"><div><p className="eyebrow">History</p><h2>Recent sessions</h2></div><Link href="/logs">Open log</Link></div>
        {workouts.length ? workouts.slice(0, 4).map(item => <div className="session-row" key={item._id || item.id}><span className="session-glyph">↗</span><div><strong>{item.name}</strong><small>{item.category || 'Training'} · {item.sets || 0} sets</small></div><time>{item.log_date ? new Date(item.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}</time></div>) : <div className="empty-state"><strong>Your first session starts here.</strong><span>Log a workout and this space becomes your training history.</span></div>}
      </section>
    </main>
  );
}
