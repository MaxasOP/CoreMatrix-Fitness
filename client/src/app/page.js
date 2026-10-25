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

  if (authLoading || (user && loading)) {
    return (
      <main className="dashboard-shell py-4 space-y-6" aria-label="Loading dashboard">
        {/* Command Hero Skeleton */}
        <div className="min-h-[360px] sm:min-h-[400px] rounded-[28px] bg-[#0d100d] border border-white/10 p-6 sm:p-10 md:p-12 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 skeleton-shimmer opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6 sm:space-y-8">
            <div>
              <div className="w-28 h-4 rounded-full skeleton-shimmer mb-4" />
              <div className="w-3/4 max-w-md h-10 sm:h-12 rounded-xl skeleton-shimmer mb-3" />
              <div className="w-1/2 max-w-xs h-7 sm:h-9 rounded-xl skeleton-shimmer mb-4" />
              <div className="w-4/5 max-w-sm h-3.5 rounded-lg skeleton-shimmer mb-2" />
              <div className="w-3/5 max-w-xs h-3.5 rounded-lg skeleton-shimmer" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="w-32 sm:w-36 h-11 sm:h-12 rounded-xl skeleton-shimmer !bg-lime-400/20" />
              <div className="w-28 sm:w-32 h-11 sm:h-12 rounded-xl skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 sm:h-28 p-3.5 sm:p-5 bg-[#0f120f] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 skeleton-shimmer opacity-25 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-3 rounded skeleton-shimmer mb-2" />
                <div className="w-14 sm:w-20 h-6 sm:h-8 rounded-lg skeleton-shimmer" />
              </div>
              <div className="relative z-10 w-20 h-2.5 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Training Visuals Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 sm:h-64 rounded-2xl bg-[#0e110e] border border-white/10 relative overflow-hidden flex items-end p-6">
              <div className="absolute inset-0 skeleton-shimmer opacity-30 pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <div className="w-16 h-2.5 rounded skeleton-shimmer" />
                <div className="w-40 sm:w-48 h-6 sm:h-7 rounded-lg skeleton-shimmer" />
                <div className="w-24 h-2.5 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <section className="command-hero">
        <div className="refracted-glass" aria-hidden="true">
          <span className="refracted-orb" />
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="command-content">
          <p className="eyebrow">Today&apos;s Focus</p>
          <h1>{user ? `${user.name.split(' ')[0]}, show up.` : 'Log the work.'}</h1>
          <p className="hero-copy">Your lifts, meals, and weekly progress—recorded without the noise.</p>
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
          <span className="training-visual-copy"><small>Strength</small><strong>Start a workout.</strong><b>Open workout log →</b></span>
        </Link>
        <Link href="/form-analysis" className="training-visual group">
          <Image src="/assets/athlete-form.webp" alt="Athlete holding a plank on dumbbells" fill quality={95} sizes="(max-width: 800px) 100vw, 50vw" className="object-cover object-[center_50%] transition-transform duration-500 ease-out group-hover:scale-105" />
          <span className="training-visual-shade" />
          <span className="training-visual-copy"><small>Technique</small><strong>Check your form.</strong><b>Upload a set →</b></span>
        </Link>
      </section>

      <section className="dashboard-grid">
        <article className="focus-card">
          <div className="section-heading"><div><p className="eyebrow">Week</p><h2>Your training</h2></div><Link href="/progress">View progress</Link></div>
          <div className="week-strip">{week.map((day, index) => <div className={summary.activeDays.has(index) ? 'day active' : 'day'} key={day}><span>{day}</span><i /></div>)}</div>
          <div className="insight-row"><span className="insight-mark">CM</span><p><strong>Training note</strong>{tip}</p></div>
        </article>

        <aside className="quick-card">
          <p className="eyebrow">Tools</p><h2>Plan and review</h2>
          <Link href="/ai-workout"><span>Build a week</span><small>Set days and equipment</small><b>↗</b></Link>
          <Link href="/ai-dietician"><span>Sort your meals</span><small>Plan around your target</small><b>↗</b></Link>
          <Link href="/form-analysis"><span>Review a lift</span><small>Upload one working set</small><b>↗</b></Link>
        </aside>
      </section>

      <section className="recent-card">
        <div className="section-heading"><div><p className="eyebrow">History</p><h2>Recent sessions</h2></div><Link href="/logs">Open log</Link></div>
        {workouts.length ? workouts.slice(0, 4).map(item => <div className="session-row" key={item._id || item.id}><span className="session-glyph">↗</span><div><strong>{item.name}</strong><small>{item.category || 'Training'} · {item.sets || 0} sets</small></div><time>{item.log_date ? new Date(item.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}</time></div>) : <div className="empty-state"><strong>No sessions logged.</strong><span>Completed workouts will appear here.</span></div>}
      </section>
    </main>
  );
}
