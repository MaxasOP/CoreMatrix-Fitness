'use client';

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const presets = [
  { name: 'Power oats', type: 'Breakfast', calories: 420, protein: 25, carbs: 55, fat: 10 },
  { name: 'Chicken bowl', type: 'Lunch', calories: 520, protein: 45, carbs: 40, fat: 12 },
  { name: 'Greek yogurt', type: 'Snack', calories: 180, protein: 16, carbs: 12, fat: 2 },
  { name: 'Salmon plate', type: 'Dinner', calories: 600, protein: 42, carbs: 30, fat: 25 },
];

function FuelContent() {
  const { user } = useContext(AuthContext);
  useDocumentMetadata({
    title: 'Fuel Your Day - Nutrition Log',
    description: 'Track your daily food intake, search presets for meals, and manage your protein, fat, and carbohydrate macronutrient targets.'
  });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  const [form, setForm] = useState({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: getTodayKey() });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const isAuthed = Boolean(user);

  useEffect(() => { fetchMeals(); }, []);

  async function fetchMeals() {
    setLoading(true);
    try { const res = await api.get('/meals'); setMeals(res.data || []); } catch (err) { console.warn(err); } finally { setLoading(false); }
  }

  function onChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); }

  function applyPreset(p) {
    setForm({ ...form, name: p.name, type: p.type, calories: p.calories, protein: p.protein, carbs: p.carbs, fat: p.fat });
  }

  async function addOrUpdateMeal() {
    if (!isAuthed) {
      setMsg('Please sign in to log meals.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    try {
      if (editingId) {
        const res = await api.put(`/meals/${editingId}`, { ...form });
        setMeals(prev => prev.map(m => ((m._id || m.id) === editingId ? (res.data || res) : m)));
        setEditingId(null);
      } else {
        const res = await api.post('/meals', form);
        setMeals(prev => [res.data || res, ...prev]);
      }
      setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: getTodayKey() });
      setMsg(editingId ? 'Meal updated successfully! 🥗' : 'Meal logged successfully! 🥑');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) { console.error('Save meal failed', err); }
  }

  function startEdit(m) {
    setEditingId(m._id || m.id);
    const rawDate = m.date || m.log_date || '';
    const safeDate = typeof rawDate === 'string' && rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    setForm({ name: m.name || '', type: m.type || 'Lunch', calories: m.calories || 0, protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0, date: safeDate || new Date().toISOString().split('T')[0] });
  }

  async function deleteMeal(id) {
    if (!isAuthed) {
      setMsg('Please sign in to manage meals.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }
    if (!window.confirm('Delete this meal?')) return;
    try {
      await api.delete(`/meals/${id}`);
      setWorkouts ? setWorkouts(prev => prev.filter(m => (m._id || m.id) !== id)) : setMeals(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (err) { console.error('Delete meal failed', err); }
  }

  const todayKey = getTodayKey();
  const todayMeals = meals.filter(m => {
    const raw = m.date || (m.log_date && m.log_date.split && m.log_date.split('T')[0]) || todayKey;
    return raw === todayKey;
  });
  const totals = {
    calories: todayMeals.reduce((s,m)=>s + (Number(m.calories)||0), 0),
    protein: todayMeals.reduce((s,m)=>s + (Number(m.protein)||0), 0),
    carbs: todayMeals.reduce((s,m)=>s + (Number(m.carbs)||0), 0),
    fat: todayMeals.reduce((s,m)=>s + (Number(m.fat)||0), 0),
  };
  const calorieGoal = user?.calorieGoal || 2200;

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
        <div className="card-soft bg-emerald-50/50 border-emerald-200 p-6">
          <div className="font-semibold text-emerald-800 uppercase tracking-wide text-xs mb-2">Sign in required</div>
          <div className="text-emerald-900 mt-1">Create an account to save meals, track macros, and see your history.</div>
          <div className="mt-4">
            <Link href="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-block">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Nutrition log</div>
              <h1 className="text-3xl font-extrabold text-gray-900">Fuel your day</h1>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500">Smart presets</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p.name} className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer" onClick={() => applyPreset(p)}>{p.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input id="fuel-meal-name" name="name" placeholder="Meal name" value={form.name} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <select id="fuel-meal-type" name="type" value={form.type} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <input id="fuel-calories" name="calories" type="number" placeholder="kcal" value={form.calories} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input id="fuel-protein" name="protein" type="number" placeholder="Protein (g)" value={form.protein} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input id="fuel-carbs" name="carbs" type="number" placeholder="Carbs (g)" value={form.carbs} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input id="fuel-fat" name="fat" type="number" placeholder="Fat (g)" value={form.fat} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input id="fuel-date" name="date" type="date" value={form.date} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all sm:col-span-2" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button id="btn-fuel-save-meal" onClick={addOrUpdateMeal} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-teal-400 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100" disabled={!isAuthed}>{editingId ? 'Save Meal' : 'Add Meal'}</button>
            {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: getTodayKey() }); }} className="bg-white/50 hover:bg-white/80 text-gray-800 px-6 py-3 rounded-xl font-bold transition-colors active:scale-95 border border-gray-200">Cancel</button>}
          </div>
        </div>

        <aside className="card p-6">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Today's Intake</div>
          <h3 className="text-4xl font-extrabold text-gray-900">{totals.calories} <span className="text-lg text-gray-400 font-medium">kcal</span></h3>
          <div className="text-sm text-gray-500 font-medium mt-1">Goal: {calorieGoal} kcal</div>
          <div className="h-3 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 animate-gradient-x rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.round((totals.calories / calorieGoal) * 100))}%` }} />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Protein</span><strong className="text-gray-900">{totals.protein}g</strong></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Carbs</span><strong className="text-gray-900">{totals.carbs}g</strong></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Fat</span><strong className="text-gray-900">{totals.fat}g</strong></div>
          </div>
        </aside>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Meal history</h3>
        </div>
        {loading ? (
          <div className="mt-3 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl w-full"></div>)}
          </div>
        ) : meals.length === 0 ? (
          <div className="card-soft py-12 mt-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-4 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </div>
            <div className="text-gray-900 font-extrabold text-lg">No meals logged</div>
            <div className="muted mt-1 text-sm">Fuel your body. Log your first meal today!</div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {meals.map(m => (
              <div key={m._id || m.id} className="card-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/80 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300">
                <div>
                  <div className="font-semibold text-gray-900">{m.name}</div>
                  <div className="text-gray-500 text-sm mt-0.5"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-medium mr-2">{m.type}</span> {m.calories} kcal • P: <span className="font-medium">{m.protein}</span> C: <span className="font-medium">{m.carbs}</span> F: <span className="font-medium">{m.fat}</span></div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button onClick={() => startEdit(m)} className="text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Edit</button>
                  <button onClick={() => deleteMeal(m._id || m.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Fuel() {
  return (
    <ProtectedRoute>
      <FuelContent />
    </ProtectedRoute>
  );
}
