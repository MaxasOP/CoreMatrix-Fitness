import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Fuel() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchMeals(); }, []);

  async function fetchMeals() {
    setLoading(true);
    try { const res = await api.get('/meals'); setMeals(res.data || []); } catch (err) { console.warn(err); } finally { setLoading(false); }
  }

  function onChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); }

  async function addOrUpdateMeal() {
    try {
      if (editingId) {
        const res = await api.put(`/meals/${editingId}`, { ...form });
        setMeals(prev => prev.map(m => ((m._id || m.id) === editingId ? (res.data || res) : m)));
        setEditingId(null);
      } else {
        const res = await api.post('/meals', form);
        setMeals(prev => [res.data || res, ...prev]);
      }
      setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] });
    } catch (err) { console.error('Save meal failed', err); }
  }

  function startEdit(m) {
    setEditingId(m._id || m.id);
    setForm({ name: m.name || '', type: m.type || 'Lunch', calories: m.calories || 0, protein: m.protein || 0, carbs: m.carbs || 0, fat: m.fat || 0, date: (m.date || '').split && (m.date.split && m.date.split('T') ? m.date.split('T')[0] : m.date) || new Date().toISOString().split('T')[0] });
  }

  async function deleteMeal(id) {
    if (!confirm('Delete this meal?')) return;
    try {
      await api.delete(`/meals/${id}`);
      setMeals(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (err) { console.error('Delete meal failed', err); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Fuel (Meals)</h2>

      <div style={{ marginBottom: 12 }}>
        <input name="name" placeholder="Meal name" value={form.name} onChange={onChange} />
        <select name="type" value={form.type} onChange={onChange} style={{ marginLeft: 8 }}>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>
        <input name="calories" type="number" placeholder="kcal" value={form.calories} onChange={onChange} style={{ width: 90, marginLeft: 8 }} />
        <input name="protein" type="number" placeholder="protein" value={form.protein} onChange={onChange} style={{ width: 90, marginLeft: 8 }} />
        <input name="carbs" type="number" placeholder="carbs" value={form.carbs} onChange={onChange} style={{ width: 90, marginLeft: 8 }} />
        <input name="fat" type="number" placeholder="fat" value={form.fat} onChange={onChange} style={{ width: 90, marginLeft: 8 }} />
        <input name="date" type="date" value={form.date} onChange={onChange} style={{ marginLeft: 8 }} />
        <button onClick={addOrUpdateMeal} style={{ marginLeft: 8 }}>{editingId ? 'Save' : 'Add'}</button>
        {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', type: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] }); }} style={{ marginLeft: 8 }}>Cancel</button>}
      </div>

      {loading ? <div>Loading…</div> : (
        <ul>
          {meals.map(m => (
            <li key={m._id || m.id} style={{ marginBottom: 6 }}>
              <strong>{m.name}</strong> — {m.type} — {m.calories} kcal — P:{m.protein} C:{m.carbs} F:{m.fat}
              <button onClick={() => startEdit(m)} style={{ marginLeft: 12 }}>Edit</button>
              <button onClick={() => deleteMeal(m._id || m.id)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
