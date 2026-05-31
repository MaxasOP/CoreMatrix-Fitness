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
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-3 flex items-center justify-between">
          {nav.map(n => {
            const isActive = location.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${isActive ? 'text-[#ff5a1f]' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
                  {n.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
