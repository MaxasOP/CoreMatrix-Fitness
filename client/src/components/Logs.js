// Cache-busting comment to force Vercel to rebuild this file
import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Logs() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [wRes, mRes] = await Promise.all([api.get('/workouts'), api.get('/meals')]);
      const workouts = (wRes.data || []).map(w => ({ type: 'workout', date: w.date || (w.log_date && w.log_date.split && w.log_date.split('T')[0]) || new Date().toISOString().split('T')[0], data: w }));
      const meals = (mRes.data || []).map(m => ({ type: 'meal', date: m.date || (m.log_date && m.log_date.split && m.log_date.split('T')[0]) || new Date().toISOString().split('T')[0], data: m }));
      const combined = workouts.concat(meals).sort((a,b) => new Date(b.date) - new Date(a.date));
      setItems(combined);
    } catch (err) { console.warn('Logs fetch error', err); } finally { setLoading(false); }
  }

  const filtered = items.filter(it => filter === 'all' || it.type === filter);

  return (
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">History</div>
            <h2 className="text-3xl font-extrabold text-gray-900">Logs</h2>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'workout' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('workout')}>Workouts</button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'meal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('meal')}>Meals</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl w-full"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mt-6 text-center text-gray-500">No entries yet. Log a workout or meal to populate your timeline.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((it, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg shadow-sm ${it.type === 'workout' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {it.type === 'workout' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{it.data.name}</div>
                    <div className="text-gray-500 text-sm mt-0.5">
                      {it.type === 'workout' ? (
                        <><span className="font-medium">{it.data.sets}</span> sets × <span className="font-medium">{it.data.reps}</span> reps • {it.data.category}</>
                      ) : (
                        <>{it.data.calories} kcal • {it.data.type}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm font-medium bg-gray-100 px-3 py-1 rounded-md self-start sm:self-auto">{it.date}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
