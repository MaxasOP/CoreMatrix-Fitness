import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Forge() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    setLoading(true);
    try { const res = await api.get('/workouts'); setWorkouts(res.data || []); } catch (err) { console.warn(err); } finally { setLoading(false); }
  }

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function addWorkout() {
    try {
      const payload = { ...form };
      const res = await api.post('/workouts', payload);
      // prepend created workout
      setWorkouts(prev => [res.data || res, ...prev]);
      setForm({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: new Date().toISOString().split('T')[0] });
    } catch (err) { console.error('Add workout failed', err); }
  }

  async function deleteWorkout(id) {
    if (!confirm('Delete this workout?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(prev => prev.filter(w => (w._id || w.id) !== id));
    } catch (err) { console.error('Delete failed', err); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Forge (Workouts)</h2>
      <div style={{ marginBottom: 12 }}>
        <input name="name" placeholder="Exercise name" value={form.name} onChange={onChange} />
        <select name="category" value={form.category} onChange={onChange} style={{ marginLeft: 8 }}>
          <option>Chest</option>
          <option>Back</option>
          <option>Legs</option>
          <option>Shoulders</option>
          <option>Arms</option>
          <option>Core</option>
          <option>Cardio</option>
        </select>
        <input name="sets" type="number" value={form.sets} onChange={onChange} style={{ width: 70, marginLeft: 8 }} />
        <input name="reps" type="number" value={form.reps} onChange={onChange} style={{ width: 70, marginLeft: 8 }} />
        <input name="weight" type="number" value={form.weight} onChange={onChange} style={{ width: 90, marginLeft: 8 }} />
        <select name="intensity" value={form.intensity} onChange={onChange} style={{ marginLeft: 8 }}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <input name="date" type="date" value={form.date} onChange={onChange} style={{ marginLeft: 8 }} />
        <button onClick={addWorkout} style={{ marginLeft: 8 }}>Add</button>
      </div>

      {loading ? <div>Loading…</div> : (
        <ul>
          {workouts.map(w => (
            <li key={w._id || w.id} style={{ marginBottom: 6 }}>
              <strong>{w.name}</strong> — {w.category} — {w.sets}×{w.reps} @ {w.weight}kg — {w.intensity}
              <button onClick={() => deleteWorkout(w._id || w.id)} style={{ marginLeft: 12 }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
