// Cache-busting comment to force Vercel to rebuild this file
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

const presets = [
  { name: 'Power oats', type: 'Breakfast', calories: 420, protein: 25, carbs: 55, fat: 10 },
  { name: 'Chicken bowl', type: 'Lunch', calories: 520, protein: 45, carbs: 40, fat: 12 },
  { name: 'Greek yogurt', type: 'Snack', calories: 180, protein: 16, carbs: 12, fat: 2 },
  { name: 'Salmon plate', type: 'Dinner', calories: 600, protein: 42, carbs: 30, fat: 25 },
];

export default function Fuel() {
  const { user } = useContext(AuthContext);
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
      setMeals(prev => prev.filter(m => (m._id || m.id) !== id));
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
        <div className="fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl bg-gray-900 text-white font-medium z-50 transition-all duration-300 transform translate-y-0">
          {msg}
        </div>
      )}
      {!isAuthed && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <div className="font-semibold text-emerald-800 uppercase tracking-wide text-xs mb-2">Sign in required</div>
          <div className="text-emerald-900 mt-1">Create an account to save meals, track macros, and see your history.</div>
          <div className="mt-4">
            <Link to="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-block">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Nutrition log</div>
              <h2 className="text-3xl font-extrabold text-gray-900">Fuel your day</h2>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500">Smart presets</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p.name} className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer" onClick={() => applyPreset(p)}>{p.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Meal name" value={form.name} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <select name="type" value={form.type} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <input name="calories" type="number" placeholder="kcal" value={form.calories} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input name="protein" type="number" placeholder="Protein (g)" value={form.protein} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input name="carbs" type="number" placeholder="Carbs (g)" value={form.carbs} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input name="fat" type="number" placeholder="Fat (g)" value={form.fat} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            <input name="date" type="date" value={form.date} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all sm:col-span-2" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={addOrUpdateMeal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0" disabled={!isAuthed}>{editingId ? 'Save Meal' : 'Add Meal'}</button>
            {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: getTodayKey() }); }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors">Cancel</button>}
          </div>
        </div>

        <aside className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Today's Intake</div>
          <h3 className="text-4xl font-extrabold text-gray-900">{totals.calories} <span className="text-lg text-gray-400 font-medium">kcal</span></h3>
          <div className="text-sm text-gray-500 font-medium mt-1">Goal: {calorieGoal} kcal</div>
          <div className="h-3 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.round((totals.calories / calorieGoal) * 100))}%` }} />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Protein</span><strong className="text-gray-900">{totals.protein}g</strong></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Carbs</span><strong className="text-gray-900">{totals.carbs}g</strong></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"><span className="text-gray-600 font-medium">Fat</span><strong className="text-gray-900">{totals.fat}g</strong></div>
          </div>
        </aside>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Meal history</h3>
        </div>
        {loading ? (
          <div className="mt-3 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 rounded-xl w-full"></div>)}
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mt-4 text-center text-gray-500">No meals yet. Add your first meal above.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {meals.map(m => (
              <div key={m._id || m.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300">
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
