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
    <div style={{ padding: 20 }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {mode !== 'login' && <input name="name" placeholder="Name" value={form.name} onChange={onChange} />}
      <div><input name="email" placeholder="Email" value={form.email} onChange={onChange} /></div>
      <div><input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} /></div>
      <div style={{ marginTop: 8 }}><button onClick={submit}>{mode === 'login' ? 'Login' : 'Register'}</button>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginLeft: 8 }}>{mode === 'login' ? 'Switch to register' : 'Switch to login'}</button></div>
      <div style={{ marginTop: 8, color: 'green' }}>{msg}</div>
    </div>
  );
}
