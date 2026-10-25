'use client';

import React, { useEffect, useState } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function LogsContent() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  useDocumentMetadata({
    title: 'Workout & Meal History Logs',
    description: 'Search, filter, and review your historical logged workouts and nutrition entries over time.'
  });

  useEffect(() => {
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
    fetchAll();
  }, []);

  const filtered = items.filter(it => filter === 'all' || it.type === filter);

  return (
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <section className="data-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">History</div>
            <h1 className="text-3xl font-extrabold text-gray-900">Logs</h1>
          </div>
          <div className="data-tabs" aria-label="Filter log entries">
            <button id="btn-logs-filter-all" className={`data-tab ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button id="btn-logs-filter-workouts" className={`data-tab ${filter === 'workout' ? 'is-active' : ''}`} onClick={() => setFilter('workout')}>Workouts</button>
            <button id="btn-logs-filter-meals" className={`data-tab ${filter === 'meal' ? 'is-active' : ''}`} onClick={() => setFilter('meal')}>Meals</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl w-full"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 mt-6 border-y border-white/10 text-center">
            <div className="text-gray-900 font-bold text-lg">No entries</div>
            <div className="muted mt-1 text-sm">Workouts and meals will appear here.</div>
          </div>
        ) : (
          <table className="log-table">
            <thead><tr><th style={{width:'18%'}}>Date</th><th style={{width:'14%'}}>Type</th><th>Entry</th><th style={{width:'30%'}}>Details</th></tr></thead>
            <tbody>{filtered.map((it, idx) => (
              <tr key={`${it.type}-${it.data._id || it.data.id || idx}`}>
                <td>{it.date}</td>
                <td><span className="log-type">{it.type}</span></td>
                <td><strong>{it.data.name}</strong><small>{it.type === 'workout' ? it.data.category : it.data.type}</small></td>
                <td>{it.type === 'workout' ? `${it.data.sets || 0} sets × ${it.data.reps || 0} reps` : `${it.data.calories || 0} kcal`}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default function Logs() {
  return (
    <ProtectedRoute>
      <LogsContent />
    </ProtectedRoute>
  );
}
