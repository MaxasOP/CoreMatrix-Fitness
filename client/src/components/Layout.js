import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Layout({ children }){
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const nav = [
    { to: '/', label: 'Dashboard', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9" stroke="#101418" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 10v10h14V10" stroke="#101418" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/forge', label: 'Forge', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="#101418" strokeWidth="1.5"/></svg>
    ) },
    { to: '/fuel', label: 'Fuel', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v4H6zM4 10h16l-2 10H6L4 10z" stroke="#101418" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/progress', label: 'Progress', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-6M22 20v-8" stroke="#101418" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/logs', label: 'Logs', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="#101418" strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#101418" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
  ];
  return (
    <div className="min-h-screen safe-area cra-overlay">
      <header className="sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="logo-mark shadow-lg" aria-hidden="true" />
            <div>
              <div className="display text-2xl">CoreMatrix</div>
              <div className="text-sm muted">Forge your fitness, fuel your body</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className={`nav-pill ${location.pathname === n.to ? 'active' : ''}`}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-sm hide-sm">Signed in as <strong>{user.name}</strong></div>
                <button onClick={logout} className="btn-primary">Sign out</button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-28 md:pb-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <nav className="bottom-nav fixed bottom-0 left-0 right-0 md:hidden">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
          {nav.map(n => (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 ${location.pathname === n.to ? 'font-semibold' : ''}`}>
              {n.icon}
              <span className="text-xs">{n.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
