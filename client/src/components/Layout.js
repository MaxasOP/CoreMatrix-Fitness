import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

export default function Layout({ children }){
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen cra-overlay">
      <header className="py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="logo-mark shadow-lg" aria-hidden="true" />
          <div>
            <div className="text-xl font-extrabold">CoreMatrix</div>
            <div className="text-sm muted">Smart training & nutrition</div>
          </div>
        </div>
        <nav className="hidden sm:flex items-center gap-4">
          <Link to="/" className="text-sm hover:underline">Dashboard</Link>
          <Link to="/forge" className="text-sm hover:underline">Forge</Link>
          <Link to="/fuel" className="text-sm hover:underline">Fuel</Link>
          <Link to="/progress" className="text-sm hover:underline">Progress</Link>
          <Link to="/logs" className="text-sm hover:underline">Logs</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm hide-sm">Signed in as <strong>{user.name}</strong></div>
              <button onClick={logout} className="btn-primary accent-fill">Sign out</button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary accent-fill">Sign in</Link>
          )}
        </div>
        {/* Mobile menu button */}
        <button className="sm:hidden ml-3 p-2 rounded bg-white/5" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#e6eef8" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </header>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="card p-3 space-y-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block">Dashboard</Link>
            <Link to="/forge" onClick={() => setMenuOpen(false)} className="block">Forge</Link>
            <Link to="/fuel" onClick={() => setMenuOpen(false)} className="block">Fuel</Link>
            <Link to="/progress" onClick={() => setMenuOpen(false)} className="block">Progress</Link>
            <Link to="/logs" onClick={() => setMenuOpen(false)} className="block">Logs</Link>
            <div className="pt-2 border-t border-white/6">
              {user ? <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full btn-primary accent-fill">Sign out</button> : <Link to="/auth" onClick={() => setMenuOpen(false)} className="w-full btn-primary accent-fill block text-center">Sign in</Link>}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
