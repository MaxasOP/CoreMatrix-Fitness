import React, { useEffect, useState } from 'react';
import api from '../api';
import bgLogs from '../assets/training-gym-LOGS.svg';
import bgDumbbel from '../assets/dumbbel-svgrepo-com.svg';

export default function Logs() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [wRes, mRes] = await Promise.all([api.get('/workouts'), api.get('/meals')]);
      const workouts = (wRes.data || []).map(w => ({ type: 'workout', date: w.date || (w.log_date && w.log_date.split && w.log_date.split('T')[0]) || new Date().toISOString().split('T')[0], data: w }));
      const meals = (mRes.data || []).map(m => ({ type: 'meal', date: m.date || (m.log_date && m.log_date.split && m.log_date.split('T')[0]) || new Date().toISOString().split('T')[0], data: m }));
      const combined = workouts.concat(meals).sort((a,b) => new Date(b.date) - new Date(a.date));
      setItems(combined);
    } catch (err) { console.warn('Logs fetch error', err); }
  }

  const filtered = items.filter(it => filter === 'all' || it.type === filter);

  return (
    <div className="mt-6 space-y-6 page page-shell">
      <img src={bgLogs} alt="" aria-hidden="true" className="bg-ornament bg-ornament--left" />
      <img src={bgDumbbel} alt="" aria-hidden="true" className="bg-ornament bg-ornament--right" />
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="tag muted">History</div>
            <h2 className="text-3xl">Logs</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className={`chip ${filter === 'all' ? 'accent-fill' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`chip ${filter === 'workout' ? 'accent-fill' : ''}`} onClick={() => setFilter('workout')}>Workouts</button>
            <button className={`chip ${filter === 'meal' ? 'accent-fill' : ''}`} onClick={() => setFilter('meal')}>Meals</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card-soft p-4 mt-4">No entries yet. Log a workout or meal to populate your timeline.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((it, idx) => (
              <div key={idx} className="card-soft p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-semibold">{it.data.name}</div>
                  <div className="muted text-sm">
                    {it.type === 'workout' ? `${it.data.sets}x${it.data.reps} — ${it.data.category}` : `${it.data.calories} kcal — ${it.data.type}`}
                  </div>
                </div>
                <div className="text-sm muted">{it.date}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
