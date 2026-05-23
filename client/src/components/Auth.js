import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const { setUser } = useContext(AuthContext);

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit() {
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email: form.email, password: form.password });
        setMsg(res.data.message || 'Logged in');
        setUser(res.data);
      } else {
        const res = await api.post('/auth/register', form);
        setMsg(res.data.message || 'Registered');
        setUser(res.data);
      }
    } catch (err) { setMsg(err.response?.data?.error || err.message); }
  }

  return (
    <div className="max-w-md mx-auto card p-6 mt-8">
      <div className="text-center mb-4">
        <div className="logo-mark mx-auto mb-2" />
        <h2 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <div className="text-sm muted">{mode === 'login' ? 'Sign in to continue' : 'Join CoreMatrix and track progress'}</div>
      </div>

      <div className="space-y-3">
        {mode !== 'login' && <input name="name" placeholder="Name" value={form.name} onChange={onChange} className="w-full p-3 rounded bg-white/5 border border-white/6" />}
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full p-3 rounded bg-white/5 border border-white/6" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="w-full p-3 rounded bg-white/5 border border-white/6" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={submit} className="btn-primary accent-fill w-full">{mode === 'login' ? 'Login' : 'Register'}</button>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-32 p-2 rounded border border-white/6">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
      </div>

      {msg && <div className="mt-3 text-sm" style={{ color: msg.toLowerCase().includes('error') ? '#ff7b7b' : '#7ef0c7' }}>{msg}</div>}
    </div>
  );
}
