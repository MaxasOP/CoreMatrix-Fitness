'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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
  const [tip, setTip] = useState('Leave one clean rep in reserve. Come back stronger tomorrow.');
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
        <div className="refracted-glass" aria-hidden="true">
          <span className="refracted-orb" />
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div>
          <p className="eyebrow">Today&apos;s Focus</p>
          <h1>{user ? `${user.name.split(' ')[0]}, show up.` : 'Log the work.'}</h1>
          <p className="hero-copy">Training, food, and recovery—kept in one place so you can see what is actually moving.</p>
          <div className="hero-actions"><Link href="/forge" className="action-primary">Train now <span>→</span></Link><Link href="/fuel" className="action-secondary">Add food</Link></div>
        </div>
        <div className="today-score" aria-label="Weekly training progress"><span>This week</span><strong>{summary.activeDays.size}<small>/7</small></strong><p>active days</p></div>
      </section>

      {error && <div className="status-note">{error} You can still explore the app.</div>}

      <section className="metrics-grid" aria-label="Today's summary">
        <Stat value={summary.sessions} label="Sessions" detail="completed today" />
        <Stat value={summary.calories.toLocaleString()} label="Energy" detail="kcal logged" />
        <Stat value={`${summary.protein}g`} label="Protein" detail="toward recovery" />
      </section>

      <section className="training-visuals" aria-label="Choose your training focus">
        <Link href="/forge" className="training-visual group">
          <Image src="/assets/athlete-strength.webp" alt="Athlete performing a dumbbell curl in a gym" fill quality={95} priority sizes="(max-width: 800px) 100vw, 50vw" className="object-cover object-[center_18%] transition-transform duration-500 ease-out group-hover:scale-105" />
          <span className="training-visual-shade" />
          <span className="training-visual-copy"><small>Strength</small><strong>Own the next rep.</strong><b>Start workout →</b></span>
        </Link>
        <Link href="/form-analysis" className="training-visual group">
          <Image src="/assets/athlete-form.webp" alt="Athlete holding a plank on dumbbells" fill quality={95} sizes="(max-width: 800px) 100vw, 50vw" className="object-cover object-[center_50%] transition-transform duration-500 ease-out group-hover:scale-105" />
          <span className="training-visual-shade" />
          <span className="training-visual-copy"><small>Technique</small><strong>Move with control.</strong><b>Analyse form →</b></span>
        </Link>
      </section>

      <section className="dashboard-grid">
        <article className="focus-card">
          <div className="section-heading"><div><p className="eyebrow">Rhythm</p><h2>Your training week</h2></div><Link href="/progress">View progress</Link></div>
          <div className="week-strip">{week.map((day, index) => <div className={summary.activeDays.has(index) ? 'day active' : 'day'} key={day}><span>{day}</span><i /></div>)}</div>
          <div className="insight-row"><span className="insight-mark">CM</span><p><strong>Coach note</strong>{tip}</p></div>
        </article>

        <aside className="quick-card">
          <p className="eyebrow">Next actions</p><h2>Keep momentum</h2>
          <Link href="/ai-workout"><span>Build a week</span><small>Set days and equipment</small><b>↗</b></Link>
          <Link href="/ai-dietician"><span>Sort your meals</span><small>Plan around your target</small><b>↗</b></Link>
          <Link href="/form-analysis"><span>Review a lift</span><small>Upload one working set</small><b>↗</b></Link>
        </aside>
      </section>

      <section className="recent-card">
        <div className="section-heading"><div><p className="eyebrow">History</p><h2>Recent sessions</h2></div><Link href="/logs">Open log</Link></div>
        {workouts.length ? workouts.slice(0, 4).map(item => <div className="session-row" key={item._id || item.id}><span className="session-glyph">↗</span><div><strong>{item.name}</strong><small>{item.category || 'Training'} · {item.sets || 0} sets</small></div><time>{item.log_date ? new Date(item.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}</time></div>) : <div className="empty-state"><strong>Your first session starts here.</strong><span>Log a workout and this space becomes your training history.</span></div>}
      </section>
    </main>
  );
}
