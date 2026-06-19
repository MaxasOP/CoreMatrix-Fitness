'use client';

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function DumbbellIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.373-.189.626-.59.626-1.036V11.87c0-.526-.411-.96-.933-1.012l-5.75-.862-.489-.979a1.125 1.125 0 00-1.047-.648H9.45a1.125 1.125 0 00-1.047.648l-.489.979-5.75.862C1.411 10.91 1 11.344 1 11.87v1.139c0 .446.253.847.626 1.036l4.875 2.437L9 21.75h6l-1.031-4.124zm0 0h-.487" />
    </svg>
  );
}

const templates = [
  { name: 'Bench Press', category: 'Chest', sets: 4, reps: 8, weight: 60, intensity: 'high' },
  { name: 'Pull Ups', category: 'Back', sets: 3, reps: 8, weight: 0, intensity: 'high' },
  { name: 'Squats', category: 'Legs', sets: 4, reps: 6, weight: 80, intensity: 'high' },
  { name: 'Shoulder Press', category: 'Shoulders', sets: 3, reps: 10, weight: 30, intensity: 'medium' },
  { name: 'Plank', category: 'Core', sets: 3, reps: 1, weight: 0, intensity: 'medium' },
];

function ForgeContent() {
  const { user } = useContext(AuthContext);
  useDocumentMetadata({
    title: 'Forge Workout Session',
    description: 'Log your daily exercises, sets, reps, weight, and intensity using our fast mobile-friendly workout tracker.'
  });
  const [workouts, setWorkouts] = useState([]);
  function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const [form, setForm] = useState({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: getTodayKey() });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const isAuthed = Boolean(user);

  useEffect(() => { fetchWorkouts(); }, []);

  async function fetchWorkouts() {
    setLoading(true);
    try { 
      const res = await api.get('/workouts'); 
      setWorkouts(res.data || []); 
    } catch (err) { 
      console.error('Failed to fetch workouts', err); 
      setMsg(`Error fetching workouts: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setMsg(''), 5000);
    } finally { 
      setLoading(false); 
    }
  }

  function onChange(e) { 
    setForm({ ...form, [e.target.name]: e.target.value }); 
    setValidationErrors(prevErrors => ({ ...prevErrors, [e.target.name]: undefined }));
  }

  function applyTemplate(t) {
    setForm({ ...form, name: t.name, category: t.category, sets: t.sets, reps: t.reps, weight: t.weight, intensity: t.intensity });
    setValidationErrors({});
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Workout name is required';
    else if (form.name.trim().length < 2 || form.name.trim().length > 100) errors.name = 'Workout name must be between 2 and 100 characters';
    
    if (form.sets <= 0 || form.sets > 50) errors.sets = 'Sets must be between 1 and 50';
    if (form.reps <= 0 || form.reps > 200) errors.reps = 'Reps must be between 1 and 200';
    if (form.weight < 0 || form.weight > 1000) errors.weight = 'Weight must be between 0 and 1000 kg';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function addWorkout() {
    if (!isAuthed) {
      setMsg('Please sign in to log workouts.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    
    if (!validateForm()) {
      setMsg('Please correct the errors in the form.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }

    try {
      const payload = { ...form };
      const res = await api.post('/workouts', payload);
      setWorkouts(prev => [res.data || res, ...prev]);
      setForm({ name: '', category: 'Chest', sets: 3, reps: 10, weight: 0, intensity: 'medium', date: getTodayKey() });
      setValidationErrors({});
      setMsg('Workout logged successfully! 🎉');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) { 
      console.error('Add workout failed', err); 
      setMsg(`Error logging workout: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setMsg(''), 5000);
    }
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
    } catch (err) { 
      console.error('Delete failed', err); 
      setMsg(`Error deleting workout: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setMsg(''), 5000);
    }
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
            <Link href="/auth" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-block">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Workout builder</div>
              <h1 className="text-3xl font-extrabold text-gray-900">Forge a session</h1>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500">Mobile-first logging</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {templates.map(t => (
              <button key={t.name} className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-orange-50 transition-all cursor-pointer" onClick={() => applyTemplate(t)}>{t.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div>
              <input id="forge-exercise-name" name="name" placeholder="Exercise name" value={form.name} onChange={onChange} className={`w-full rounded-xl border ${validationErrors.name ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all`} />
              {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
            </div>
            <select id="forge-category" name="category" value={form.category} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all">
              <option>Chest</option>
              <option>Back</option>
              <option>Legs</option>
              <option>Shoulders</option>
              <option>Arms</option>
              <option>Core</option>
              <option>Cardio</option>
            </select>
            <div>
              <input id="forge-sets" name="sets" type="number" placeholder="Sets" value={form.sets} onChange={onChange} className={`w-full rounded-xl border ${validationErrors.sets ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all`} />
              {validationErrors.sets && <p className="text-red-500 text-xs mt-1">{validationErrors.sets}</p>}
            </div>
            <div>
              <input id="forge-reps" name="reps" type="number" placeholder="Reps" value={form.reps} onChange={onChange} className={`w-full rounded-xl border ${validationErrors.reps ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all`} />
              {validationErrors.reps && <p className="text-red-500 text-xs mt-1">{validationErrors.reps}</p>}
            </div>
            <div>
              <input id="forge-weight" name="weight" type="number" placeholder="Weight (kg)" value={form.weight} onChange={onChange} className={`w-full rounded-xl border ${validationErrors.weight ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all`} />
              {validationErrors.weight && <p className="text-red-500 text-xs mt-1">{validationErrors.weight}</p>}
            </div>
            <select id="forge-intensity" name="intensity" value={form.intensity} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input id="forge-date" name="date" type="date" value={form.date} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all sm:col-span-2" />
          </div>

          <div className="mt-4">
            <button id="btn-forge-add-workout" onClick={addWorkout} className="bg-[#ff5a1f] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-orange-500/20 hover:-translate-y-0.5 hover:scale-105 hover:shadow-orange-500/30 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100" disabled={!isAuthed}>Add workout</button>
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
              <DumbbellIcon className="w-10 h-10" />
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

export default function Forge() {
  return (
    <ProtectedRoute>
      <ForgeContent />
    </ProtectedRoute>
  );
}
