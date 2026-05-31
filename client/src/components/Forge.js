// Cache-busting comment to force Vercel to rebuild this file v2
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

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
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    try {
      const payload = { ...form };
      const res = await api.post('/workouts', payload);
      // prepend created workout
      setWorkouts(prev => [res.data || res, ...prev]);
      setForm({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: getTodayKey() });
      setMsg('Workout logged successfully! 🎉');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) { console.error('Add workout failed', err); }
  }

  async function deleteWorkout(id) {
    if (!isAuthed) {
      setMsg('Please sign in to manage workouts.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    if (!window.confirm('Delete this workout?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(prev => prev.filter(w => (w._id || w.id) !== id));
    } catch (err) { console.error('Delete failed', err); }
  }

  return (
    <div className="mt-6 space-y-8 page page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {msg && (
        <div className="fixed z-[100] bottom-24 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 px-5 py-4 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-xl border border-gray-100 text-gray-900 font-bold flex items-center gap-4 reveal">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 ${msg.includes('sign in') || msg.includes('manage') ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/30' : 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-emerald-500/30'}`}>
            {msg.includes('sign in') || msg.includes('manage') ? (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            )}
          </div>
          <div className="text-sm sm:text-base flex-1">{msg}</div>
        </div>
      )}
      {!isAuthed && (
        <div className="card-soft bg-orange-50/50 border-orange-200 p-6">
          <div className="font-semibold text-orange-800 uppercase tracking-wide text-xs mb-2">Sign in required</div>
          <div className="text-orange-900 mt-1">Create an account to save workouts, track progress, and see your history.</div>
          <div className="mt-4">
            <Link to="/auth" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-block">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Workout builder</div>
              <h2 className="text-3xl font-extrabold text-gray-900">Forge a session</h2>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500">Mobile-first logging</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {templates.map(t => (
              <button key={t.name} className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-orange-50 transition-all cursor-pointer" onClick={() => applyTemplate(t)}>{t.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Exercise name" value={form.name} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
            <select name="category" value={form.category} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all">
              <option>Chest</option>
              <option>Back</option>
              <option>Legs</option>
              <option>Shoulders</option>
              <option>Arms</option>
              <option>Core</option>
              <option>Cardio</option>
            </select>
            <input name="sets" type="number" placeholder="Sets" value={form.sets} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
            <input name="reps" type="number" placeholder="Reps" value={form.reps} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
            <input name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
            <select name="intensity" value={form.intensity} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input name="date" type="date" value={form.date} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all sm:col-span-2" />
          </div>

          <div className="mt-4">
            <button onClick={addWorkout} className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0" disabled={!isAuthed}>Add workout</button>
          </div>
        </div>

        <aside className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-transform duration-700">
            <svg width="200" height="200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="relative z-10">
            <div className="font-semibold text-gray-400 uppercase tracking-wide text-xs mb-2">Focus</div>
            <h3 className="text-2xl font-extrabold text-white">Train with intent</h3>
            <p className="text-gray-300 mt-3 leading-relaxed">Use templates to speed up logging. Capture sets, reps, and intensity in under 10 seconds.</p>
          </div>
        </aside>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Recent sessions</h3>
        </div>
        {loading ? (
          <div className="mt-3 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl w-full"></div>)}
          </div>
        ) : workouts.length === 0 ? (
          <div className="card-soft py-12 mt-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-4 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="text-gray-900 font-extrabold text-lg">No workouts yet</div>
            <div className="muted mt-1 text-sm">Your journey starts here. Add your first session above!</div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {workouts.map(w => (
              <div key={w._id || w.id} className="card-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/80 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-300">
                <div>
                  <div className="font-semibold text-gray-900">{w.name}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{w.category} • <span className="font-medium">{w.sets}</span>x<span className="font-medium">{w.reps}</span> @ {w.weight}kg • {w.intensity}</div>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <div className="text-gray-400 text-sm font-medium bg-gray-100 px-3 py-1 rounded-md">{new Date(w.log_date).toLocaleDateString()}</div>
                  <button onClick={() => deleteWorkout(w._id || w.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
