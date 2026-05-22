import React, { createContext, useEffect, useState } from 'react';
import api from './api';

export const AuthContext = createContext({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cmUser') || 'null'); } catch (e) { return null; }
  });

  useEffect(() => {
    try { if (user) localStorage.setItem('cmUser', JSON.stringify(user)); else localStorage.removeItem('cmUser'); }
    catch (e) {}
  }, [user]);

  function logout() {
    setUser(null);
    // Optionally notify backend or revoke token
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}
