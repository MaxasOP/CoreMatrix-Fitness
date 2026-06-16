'use client';

import React, { createContext, useEffect, useState } from 'react';
import api from './api';

export const AuthContext = createContext({ user: null, setUser: () => {}, logout: () => {}, api });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage only on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cmUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (loading) return;
    try {
      if (user) {
        localStorage.setItem('cmUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('cmUser');
      }
    } catch (e) {
      console.error('Error saving user state:', e);
    }
  }, [user, loading]);

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, api, authLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}
