import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import heroTraining from '../assets/hero-training.svg';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit() {
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email: form.email, password: form.password });
        setMsg(res.data.message || 'Logged in');
        setUser(res.data);
        navigate('/');
      } else {
        const res = await api.post('/auth/register', form);
        setMsg(res.data.message || 'Registered');
        setUser(res.data);
        navigate('/setup');
      }
    } catch (err) { setMsg(err.response?.data?.error || err.message); }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6 page">
      <div className="card p-6">
        <div className="text-center mb-4">
          <div className="logo-mark mx-auto mb-2" />
          <h2 className="text-3xl">{mode === 'login' ? 'Welcome back' : 'Join the program'}</h2>
          <div className="text-sm muted">{mode === 'login' ? 'Log in and keep the momentum' : 'Create a free account and start tracking today'}</div>
        </div>

        <div className="space-y-3">
          {mode !== 'login' && <input name="name" placeholder="Name" value={form.name} onChange={onChange} className="input" />}
          <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="input" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="input" />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <button onClick={submit} className="btn-primary w-full">{mode === 'login' ? 'Login' : 'Register'}</button>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="btn-secondary w-full sm:w-32">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
        </div>

        {msg && <div className="mt-3 text-sm" style={{ color: msg.toLowerCase().includes('error') ? '#ff6b6b' : '#15803d' }}>{msg}</div>}
      </div>

      <div className="card p-6 flex flex-col justify-between">
        <div>
          <div className="tag muted">Why it works</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Daily stats that actually matter: calories, protein, and total volume.</li>
            <li>Quick log flows built for mobile (one screen, no clutter).</li>
            <li>Your data is private — only signed-in users see their entries.</li>
          </ul>
        </div>
        <div className="photo-card mt-4">
          <img src={heroTraining} alt="Training illustration" />
        </div>
      </div>
    </div>
  );
}
