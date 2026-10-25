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
    { to: '/fuel', label: 'Meal', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v4H6zM4 10h16l-2 10H6L4 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/progress', label: 'Progress', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-6M22 20v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/logs', label: 'Logs', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ) },
    { to: '/ai-dietician', label: 'Dietician', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/ai-workout', label: 'Planner', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M7 8v8M17 8v8M4 10v4M20 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/form-analysis', label: 'Analysis', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 10l-4 4-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
    ) },
    { to: '/supplements', label: 'Store', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { to: '/leaderboards', label: 'Ranks', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0v-8.25c0-.621-.503-1.125-1.125-1.125H9.497c-.621 0-1.125.504-1.125 1.125v8.25m5.007 0H9.497" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

      <header className="site-header sticky top-0 z-50 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <Link href="/" className="group shrink-0 flex items-center" aria-label="CoreMatrix home">
            <Image
              src="/assets/corematrix-logo.webp"
              alt="CoreMatrix"
              width={768}
              height={256}
              preload
              quality={95}
              className="site-logo h-8 sm:h-10 w-auto transition-opacity group-hover:opacity-75"
              sizes="(max-width: 640px) 140px, 170px"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {visibleNavItems.map(n => {
              const isActive = pathname === n.to;
              return (
                <Link key={n.to} href={n.to} className={`px-4 py-2 rounded-xl text-sm md:text-[15px] font-semibold transition-colors ${isActive ? 'desktop-nav-active bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {n.label}
                </Link>
              );
            })}
            <details className="relative">
              <summary className="list-none cursor-pointer px-4 py-2 rounded-xl text-sm md:text-[15px] font-semibold text-gray-400 hover:text-white hover:bg-white/5">Explore ▾</summary>
              <div className="nav-menu absolute right-0 top-13 w-56 rounded-xl border p-2 shadow-xl bg-[#11140f]/95 backdrop-blur-2xl">
                {moreNavItems.map(n => <Link key={n.to} href={n.to} className="block rounded-lg px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white font-medium">{n.label}</Link>)}
              </div>
            </details>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-xs hidden lg:block text-gray-400 font-medium">Signed in as <strong className="text-gray-200">{user.name}</strong></div>
                <button onClick={logout} className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 px-4 py-2 rounded-xl transition-colors">Sign out</button>
              </>
            ) : (
              <Link href="/auth" className="prism-button px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all hover:-translate-y-0.5">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main key={pathname} className="site-main pb-28 md:pb-16 pt-2">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-3 inset-x-3 sm:inset-x-6 z-50 md:hidden">
        <div className="mobile-dock rounded-2xl border border-white/15 bg-[#10140f]/92 backdrop-blur-2xl shadow-2xl px-2 py-1.5 flex items-center justify-around h-16">
          {visibleNavItems.map(n => {
            const isActive = pathname === n.to;
            return (
              <Link key={n.to} href={n.to} className={`flex flex-col items-center gap-0.5 py-1 px-2.5 min-w-[3.5rem] rounded-xl transition-all ${isActive ? 'text-lime-300 font-bold' : 'text-gray-400 hover:text-white'}`} onClick={() => setShowMoreNav(false)}>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-lime-300/15 text-lime-300' : 'bg-transparent text-gray-400'}`}>
                  {React.cloneElement(n.icon, { width: 22, height: 22 })}
                </div>
                <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">{n.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button onClick={() => setShowMoreNav(true)} className={`flex flex-col items-center gap-0.5 py-1 px-2.5 min-w-[3.5rem] rounded-xl transition-all ${showMoreNav ? 'text-lime-300 font-bold' : 'text-gray-400 hover:text-white'}`}>
            <div className={`p-1 rounded-lg transition-colors ${showMoreNav ? 'bg-lime-300/15 text-lime-300' : 'bg-transparent text-gray-400'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/><circle cx="5" cy="12" r="1.2"/></svg>
            </div>
            <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">More</span>
          </button>
        </div>
      </nav>

      {/* More Navigation Overlay */}
      {showMoreNav && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowMoreNav(false)}>
          <div className="more-sheet rounded-t-3xl w-full max-h-[80vh] overflow-y-auto pb-safe p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">More</h3>
              <button onClick={() => setShowMoreNav(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {moreNavItems.map(n => {
                const isActive = pathname === n.to;
                return (
                  <Link key={n.to} href={n.to} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${isActive ? 'bg-lime-300/10 text-lime-300' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`} onClick={() => setShowMoreNav(false)}>
                    <div className="p-1.5 rounded-xl">
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
