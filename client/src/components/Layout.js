import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Layout({ children }){
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const nav = [
    { to: '/', label: 'Dashboard', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/forge', label: 'Forge', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="1.5"/></svg>
    ) },
    { to: '/fuel', label: 'Fuel', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v4H6zM4 10h16l-2 10H6L4 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/progress', label: 'Progress', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-6M22 20v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/logs', label: 'Logs', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/ai-dietician', label: 'AI Coach', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/ai-workout', label: 'AI Workout', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M7 8v8M17 8v8M4 10v4M20 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/supplements', label: 'Store', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/leaderboards', label: 'Ranks', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0v-8.25c0-.621-.503-1.125-1.125-1.125H9.497c-.621 0-1.125.504-1.125 1.125v8.25m5.007 0H9.497" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
  ];
  return (
    <div className="min-h-screen text-gray-900 font-sans selection:bg-[#ff5a1f]/20 relative z-0">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff5a1f] to-orange-500 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center transform group-hover:-rotate-3 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-gray-900">CoreMatrix</div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Forge & Fuel</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
            {nav.map(n => {
              const isActive = location.pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm hidden lg:block text-gray-500 font-medium">Signed in as <strong className="text-gray-900">{user.name}</strong></div>
                <button onClick={logout} className="text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors">Sign out</button>
              </>
            ) : (
              <Link to="/auth" className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:-translate-y-0.5">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="pb-28 md:pb-12 pt-2">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {nav.map(n => {
            const isActive = location.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1.5 min-w-[4.5rem] transition-colors ${isActive ? 'text-[#ff5a1f]' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
                  {n.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
