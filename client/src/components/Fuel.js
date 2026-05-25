import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import mealBowl from '../assets/meal-bowl.svg';

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
      setMsg('Meal saved.');
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
      return;
    }
    if (!confirm('Delete this meal?')) return;
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
    <div className="mt-6 space-y-6 page">
      {!isAuthed && (
        <div className="card-soft p-4">
          <div className="tag muted">Sign in required</div>
          <div className="mt-2">Create an account to save meals, track macros, and see your history.</div>
          <div className="mt-3">
            <Link to="/auth" className="btn-primary">Sign in</Link>
          </div>
        </div>
      )}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="tag muted">Nutrition log</div>
              <h2 className="text-3xl">Fuel your day</h2>
            </div>
            <span className="chip">Smart presets</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p.name} className="chip" onClick={() => applyPreset(p)}>{p.name}</button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="Meal name" value={form.name} onChange={onChange} className="input" />
            <select name="type" value={form.type} onChange={onChange} className="input">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
            <input name="calories" type="number" placeholder="kcal" value={form.calories} onChange={onChange} className="input" />
            <input name="protein" type="number" placeholder="protein" value={form.protein} onChange={onChange} className="input" />
            <input name="carbs" type="number" placeholder="carbs" value={form.carbs} onChange={onChange} className="input" />
            <input name="fat" type="number" placeholder="fat" value={form.fat} onChange={onChange} className="input" />
            <input name="date" type="date" value={form.date} onChange={onChange} className="input" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={addOrUpdateMeal} className="btn-primary" disabled={!isAuthed}>{editingId ? 'Save' : 'Add meal'}</button>
            {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: getTodayKey() }); }} className="btn-secondary">Cancel</button>}
          </div>
          {msg && <div className="text-sm mt-2" style={{ color: msg.toLowerCase().includes('sign in') ? '#b45309' : '#15803d' }}>{msg}</div>}
        </div>

        <aside className="card p-5">
          <div className="tag muted">Today</div>
          <h3 className="text-2xl">{totals.calories} kcal</h3>
          <div className="muted text-sm">Goal: {calorieGoal} kcal</div>
          <div className="h-2 bg-black/10 rounded mt-3">
            <div className="h-2 accent-fill rounded" style={{ width: `${Math.min(100, Math.round((totals.calories / calorieGoal) * 100))}%` }} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Protein</span><strong>{totals.protein}g</strong></div>
            <div className="flex items-center justify-between"><span>Carbs</span><strong>{totals.carbs}g</strong></div>
            <div className="flex items-center justify-between"><span>Fat</span><strong>{totals.fat}g</strong></div>
          </div>
          <div className="photo-card mt-4">
            <img src={mealBowl} alt="Meal illustration" />
          </div>
        </aside>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl">Meal history</h3>
          {loading && <span className="muted text-sm">Loading…</span>}
        </div>
        {meals.length === 0 ? (
          <div className="card-soft p-4 mt-3">No meals yet. Add your first meal above.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {meals.map(m => (
              <div key={m._id || m.id} className="card-soft p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="muted text-sm">{m.type} — {m.calories} kcal — P:{m.protein} C:{m.carbs} F:{m.fat}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => startEdit(m)} className="btn-secondary">Edit</button>
                  <button onClick={() => deleteMeal(m._id || m.id)} className="btn-secondary">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
