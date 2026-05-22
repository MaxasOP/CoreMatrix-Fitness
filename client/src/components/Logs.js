import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Logs() {
  const [items, setItems] = useState([]);

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Logs</h2>
      <ul>
        {items.map((it, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <strong>{it.type === 'workout' ? it.data.name : it.data.name}</strong> — {it.type} — {it.date}
            {it.type === 'workout' && <span> — {it.data.sets}×{it.data.reps}</span>}
            {it.type === 'meal' && <span> — {it.data.calories} kcal</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
