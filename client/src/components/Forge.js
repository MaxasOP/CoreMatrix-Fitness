import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import heroTraining from '../assets/hero-training.svg';

const templates = [
  { name: 'Bench Press', category: 'Chest', sets: 4, reps: 8, weight: 60, intensity: 'high' },
  { name: 'Pull Ups', category: 'Back', sets: 3, reps: 8, weight: 0, intensity: 'high' },
  { name: 'Squats', category: 'Legs', sets: 4, reps: 6, weight: 80, intensity: 'high' },
  { name: 'Shoulder Press', category: 'Shoulders', sets: 3, reps: 10, weight: 30, intensity: 'medium' },
  { name: 'Plank', category: 'Core', sets: 3, reps: 1, weight: 0, intensity: 'medium' },
];

export default function Forge() {
  const { user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const [form, setForm] = useState({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: getTodayKey() });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isAuthed = Boolean(user);

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    setLoading(true);
    try { const res = await api.get('/workouts'); setWorkouts(res.data || []); } catch (err) { console.warn(err); } finally { setLoading(false); }
  }

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  function applyTemplate(t) {
    setForm({ ...form, name: t.name, category: t.category, sets: t.sets, reps: t.reps, weight: t.weight, intensity: t.intensity });
  }

  async function addWorkout() {
    if (!isAuthed) {
      setMsg('Please sign in to log workouts.');
      return;
    }
    try {
      const payload = { ...form };
      const res = await api.post('/workouts', payload);
      // prepend created workout
      setWorkouts(prev => [res.data || res, ...prev]);
      setForm({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: getTodayKey() });
      setMsg('Workout logged.');
    } catch (err) { console.error('Add workout failed', err); }
  }

  async function deleteWorkout(id) {
    if (!isAuthed) {
      setMsg('Please sign in to manage workouts.');
      return;
    }
    if (!confirm('Delete this workout?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(prev => prev.filter(w => (w._id || w.id) !== id));
    } catch (err) { console.error('Delete failed', err); }
  }

  return (
    <div className="mt-6 space-y-6 page">
      {!isAuthed && (
        <div className="card-soft p-4">
          <div className="tag muted">Sign in required</div>
          <div className="mt-2">Create an account to save workouts, track progress, and see your history.</div>
          <div className="mt-3">
            <Link to="/auth" className="btn-primary">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="tag muted">Workout builder</div>
              <h2 className="text-3xl">Forge a session</h2>
            </div>
            <span className="chip">Mobile-first logging</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {templates.map(t => (
              <button key={t.name} className="chip" onClick={() => applyTemplate(t)}>{t.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Exercise name" value={form.name} onChange={onChange} className="input" />
            <select name="category" value={form.category} onChange={onChange} className="input">
              <option>Chest</option>
              <option>Back</option>
              <option>Legs</option>
              <option>Shoulders</option>
              <option>Arms</option>
              <option>Core</option>
              <option>Cardio</option>
            </select>
            <input name="sets" type="number" value={form.sets} onChange={onChange} className="input" />
            <input name="reps" type="number" value={form.reps} onChange={onChange} className="input" />
            <input name="weight" type="number" value={form.weight} onChange={onChange} className="input" />
            <select name="intensity" value={form.intensity} onChange={onChange} className="input">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input name="date" type="date" value={form.date} onChange={onChange} className="input" />
          </div>

          <div className="mt-4">
            <button onClick={addWorkout} className="btn-primary" disabled={!isAuthed}>Add workout</button>
            {msg && <div className="text-sm mt-2" style={{ color: msg.toLowerCase().includes('sign in') ? '#b45309' : '#15803d' }}>{msg}</div>}
          </div>
        </div>

        <aside className="card p-5">
          <div className="tag muted">Focus</div>
          <h3 className="text-2xl">Train with intent</h3>
          <p className="muted mt-2">Use templates to speed up logging. Capture sets, reps, and intensity in under 10 seconds.</p>
          <div className="photo-card mt-4">
            <img src={heroTraining} alt="Training illustration" />
          </div>
        </aside>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl">Recent sessions</h3>
          {loading && <span className="muted text-sm">Loading…</span>}
        </div>
        {workouts.length === 0 ? (
          <div className="card-soft p-4 mt-3">No workouts yet. Add your first session above.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {workouts.map(w => (
              <div key={w._id || w.id} className="card-soft p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-semibold">{w.name}</div>
                  <div className="muted text-sm">{w.category} — {w.sets}x{w.reps} @ {w.weight}kg — {w.intensity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="muted text-sm">{new Date(w.log_date).toLocaleDateString()}</div>
                  <button onClick={() => deleteWorkout(w._id || w.id)} className="btn-secondary">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
