'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AuthContext, AuthProvider } from '../AuthContext';

function LayoutContent({ children }) {
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();
  const [showMoreNav, setShowMoreNav] = useState(false);

  const nav = [
    { to: '/', label: 'Dashboard', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/forge', label: 'Workout', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="1.5"/></svg>
    ) },
    { to: '/ai-workout', label: 'Plan', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M7 8v8M17 8v8M4 10v4M20 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/progress', label: 'Progress', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-6M22 20v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/logs', label: 'Logs', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/form-analysis', label: 'Analysis', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 10l-4 4-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
    ) },
    { to: '/fuel', label: 'Meal log', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v4H6zM4 10h16l-2 10H6L4 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
  ];

  const visibleNavItems = nav.slice(0, 4);
  const moreNavItems = nav.slice(4);

  return (
    <div className="site-shell min-h-screen font-sans selection:bg-lime-300/30 relative z-0">
      <div className="site-canvas" aria-hidden="true">
        <span className="site-orb site-orb--one" />
        <span className="site-orb site-orb--two" />
        <div className="site-refraction"><i /><i /><i /><i /><i /><i /><i /></div>
      </div>

      <header className="site-header sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
        <div className="site-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="group shrink-0 flex items-center" aria-label="CoreMatrix home">
            <Image
              src="/assets/corematrix-logo.webp"
              alt="CoreMatrix"
              width={768}
              height={256}
              preload
              quality={95}
              className="site-logo w-auto transition-opacity group-hover:opacity-80"
              sizes="(max-width: 640px) 132px, 156px"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {visibleNavItems.map(n => {
              const isActive = pathname === n.to;
              return (
                <Link key={n.to} href={n.to} aria-current={isActive ? 'page' : undefined} className={`desktop-nav-link ${isActive ? 'desktop-nav-active' : ''}`}>
                  {n.label}
                </Link>
              );
            })}
            <details className="relative">
              <summary className="desktop-nav-link list-none cursor-pointer">Explore <span aria-hidden="true">▾</span></summary>
              <div className="nav-menu absolute right-0 top-14 w-60 rounded-2xl border p-2.5 shadow-2xl bg-[#11140f]/95 backdrop-blur-2xl border-white/15">
                {moreNavItems.map(n => <Link key={n.to} href={n.to} className="block rounded-xl px-4 py-3 text-base text-gray-200 hover:bg-white/10 hover:text-white font-semibold transition-colors">{n.label}</Link>)}
              </div>
            </details>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                <div className="text-sm hidden lg:block text-gray-300 font-semibold">Signed in as <strong className="text-white">{user.name}</strong></div>
                <button onClick={logout} className="header-account-action text-gray-200 hover:text-red-400">Sign out</button>
              </>
            ) : (
              <Link href="/auth" className="prism-button header-account-action font-bold transition-opacity hover:opacity-90">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main key={pathname} className="site-main">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="mobile-nav-shell fixed bottom-0 inset-x-0 z-50 md:hidden" aria-label="Primary navigation">
        <div className="mobile-dock flex items-center justify-around">
          {visibleNavItems.map(n => {
            const isActive = pathname === n.to;
            return (
              <Link key={n.to} href={n.to} aria-current={isActive ? 'page' : undefined} className={`mobile-nav-item ${isActive ? 'is-active' : ''}`} onClick={() => setShowMoreNav(false)}>
                <div className="mobile-nav-icon">
                  {React.cloneElement(n.icon, { width: 22, height: 22 })}
                </div>
                <span>{n.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button type="button" aria-label="Open more navigation" aria-expanded={showMoreNav} onClick={() => setShowMoreNav(true)} className={`mobile-nav-item ${showMoreNav ? 'is-active' : ''}`}>
            <div className="mobile-nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
            </div>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* More Navigation Overlay */}
      {showMoreNav && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowMoreNav(false)}>
          <div className="more-sheet rounded-t-3xl w-full max-h-[80vh] overflow-y-auto pb-safe p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">More</h3>
              <button type="button" aria-label="Close more navigation" onClick={() => setShowMoreNav(false)} className="text-gray-400 hover:text-white min-h-11 min-w-11 grid place-items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="more-nav-grid">
              {moreNavItems.map(n => {
                const isActive = pathname === n.to;
                return (
                  <Link key={n.to} href={n.to} aria-current={isActive ? 'page' : undefined} className={`more-nav-link ${isActive ? 'is-active' : ''}`} onClick={() => setShowMoreNav(false)}>
                    <div>
                      {n.icon}
                    </div>
                    <span className="text-xs font-semibold text-center">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
