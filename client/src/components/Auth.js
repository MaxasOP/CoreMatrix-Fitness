// Cache-busting comment to force Vercel to rebuild this file
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useDocumentMetadata({
    title: mode === 'login' ? 'Sign In' : 'Join Program',
    description: 'Access your CoreMatrix account to log workouts, track progress, and customize your diet and fitness goals.'
  });

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="card p-8 sm:p-10 shadow-2xl shadow-gray-200/50 border-white/80">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center transform -rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{mode === 'login' ? 'Welcome back 👋' : 'Join the program 🚀'}</h1>
            <div className="text-gray-500 mt-2 font-medium">{mode === 'login' ? 'Log in and keep the momentum going.' : 'Create a free account and start tracking today.'}</div>
          </div>

          <div className="space-y-4">
            {mode !== 'login' && <input id="auth-name" name="name" placeholder="Full Name" value={form.name} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />}
            <input id="auth-email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
            <input id="auth-password" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:bg-white focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/20 outline-none transition-all" />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button id="btn-auth-submit" onClick={submit} className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-black text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 active:scale-95">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
            <button id="btn-auth-switch-mode" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full bg-white/50 hover:bg-white/80 text-gray-700 px-6 py-3.5 rounded-xl font-bold transition-all border border-gray-200 active:scale-95">{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
          </div>

          {msg && <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>{msg}</div>}
        </div>

        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#ff5a1f] via-pink-500 to-orange-500 animate-gradient-x rounded-3xl p-10 text-white shadow-xl relative overflow-hidden h-full min-h-[400px]">
          <div className="absolute -bottom-20 -right-20 opacity-10 transform rotate-12 scale-150">
            <svg width="400" height="400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">Why it works</div>
            <h3 className="text-4xl font-extrabold leading-tight mb-6">Track with intent.</h3>
            <ul className="space-y-5 text-lg text-white/90 font-medium">
              <li className="flex items-center gap-3"><div className="p-1 bg-white/20 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div> Daily stats that actually matter ⚡️</li>
              <li className="flex items-center gap-3"><div className="p-1 bg-white/20 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div> Quick log flows built for mobile 📱</li>
              <li className="flex items-center gap-3"><div className="p-1 bg-white/20 rounded-full"><svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div> Your private data, completely secure 🔒</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
