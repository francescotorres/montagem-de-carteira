import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas em ms
const TOKEN_KEY = 'montagem_token';
const USER_KEY = 'montagem_user';
const API_BASE = 'http://localhost:8080';

interface AuthUser { nome: string; }
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (nome: string, senha: string) => Promise<void>;
  logout: (reason?: string) => void;
  apiBase: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback((reason?: string) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (reason === 'inactivity') {
      sessionStorage.setItem('logout_reason', 'Sessão expirada por inatividade. Por favor, faça login novamente.');
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => logout('inactivity'), INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [token, resetInactivityTimer]);

  const login = async (nome: string, senha: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Credenciais inválidas');
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ nome: data.nome });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({ nome: data.nome }));
    sessionStorage.removeItem('logout_reason');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, login, logout, apiBase: API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
};
