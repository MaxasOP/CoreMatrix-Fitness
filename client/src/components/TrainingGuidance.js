'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../api';

export default function TrainingGuidance() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.get('/ai/training-coach').then(({ data }) => { if (active) setItems(data.recommendations || []); }).catch(() => { if (active) setError('Training guidance is unavailable. Your saved logs are unchanged.'); });
    return () => { active = false; };
  }, []);
  return <section className="workout-receipt" aria-labelledby="training-guidance-title">
    <p className="eyebrow">From your last sessions</p><h2 id="training-guidance-title">Take the next step deliberately.</h2>
    {error ? <p role="alert">{error}</p> : items === null ? <p role="status">Loading training guidance…</p> : !items.length ? <p>Log an exercise, rate its effort, and attach a form review to establish your baseline.</p> : items.slice(0, 5).map(item => <div className="guidance-row" key={item.workoutId}><div><h3>{item.name}</h3><p>{item.reason}</p>{item.cue && <p>Review cue: {item.cue}</p>}</div><strong>{item.weight} kg × {item.reps} reps</strong></div>)}
    <Link href="/forge" className="plan-day-action">Open workout log →</Link>
  </section>;
}
