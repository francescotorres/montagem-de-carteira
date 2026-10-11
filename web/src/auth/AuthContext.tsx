import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas em ms
const TOKEN_KEY = 'montagem_token';
const USER_KEY = 'montagem_user';
const USERS_DB_KEY = 'montagem_local_users';

// Em produção (ex: Vercel), se VITE_API_URL não estiver configurada, usa modo local/standalone seguro
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    // Suporte para rede local (acesso mobile na mesma Wi-Fi do computador de desenvolvimento)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
      return `http://${host}:8080`;
    }
  }
  return '';
};

const API_BASE = getApiBase();

export interface UserItem {
  id: number;
  nome: string;
}

interface LocalStoredUser {
  id: number;
  nome: string;
  passwordHash: string;
  isInitialPlaceholder?: boolean;
}

const INITIAL_PLACEHOLDER_USER: LocalStoredUser = {
  id: 1,
  nome: 'Francesco',
  passwordHash: '123456',
  isInitialPlaceholder: true
};

const isPlaceholderUser = (u: LocalStoredUser): boolean => {
  return Boolean(u.isInitialPlaceholder) ||
    ((u.nome.toLowerCase() === 'francesco' || u.nome.toLowerCase() === 'admin') && u.passwordHash === '123456');
};

const getLocalUsers = (): LocalStoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      // Primeiro acesso antes de cadastrar qualquer usuário: inicializa placeholder
      const initial = [{ ...INITIAL_PLACEHOLDER_USER }];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
      return initial;
    }

    let users: LocalStoredUser[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    } catch {
      users = [];
    }

    // Se já existem usuários cadastrados (não-placeholder), remove qualquer placeholder inicial
    const hasRealUsers = users.some(u => !isPlaceholderUser(u));
    if (hasRealUsers) {
      const cleaned = users.filter(u => !isPlaceholderUser(u));
      if (cleaned.length !== users.length) {
        saveLocalUsers(cleaned);
        return cleaned;
      }
    }

    return users;
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: LocalStoredUser[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

interface AuthUser { nome: string; }

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (nome: string, senha: string) => Promise<void>;
  register: (nome: string, senha: string) => Promise<void>;
  logout: (reason?: string) => void;
  listUsers: () => Promise<UserItem[]>;
  createUser: (nome: string, senha: string) => Promise<UserItem>;
  deleteUser: (id: number) => Promise<void>;
  updatePassword: (id: number, novaSenha: string) => Promise<void>;
  hasRegisteredUsers: () => boolean;
  apiBase: string;
  isStandaloneMode: boolean;
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
  const [isStandalone, setIsStandalone] = useState<boolean>(!API_BASE);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback((reason?: string) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (reason === 'inactivity') {
      sessionStorage.setItem('logout_reason', 'Sessão expirada por inatividade (2 horas). Por favor, faça login novamente.');
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
    const trimmedNome = nome.trim();
    const trimmedSenha = senha.trim();

    if (!trimmedNome || !trimmedSenha) {
      throw new Error('Informe o usuário e a senha');
    }

    // Se temos uma API configurada, tentamos a conexão com o backend Kotlin/Spring Boot
    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: trimmedNome, senha: trimmedSenha })
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
        return;
      } catch (err: unknown) {
        // Se a API falhou por estar offline (Failed to fetch)
        const isNetworkErr = err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed'));
        if (!isNetworkErr) {
          throw err;
        }
        console.warn('Backend indisponível, alternando automaticamente para modo autônomo local.');
        setIsStandalone(true);
      }
    }

    // Modo Standalone Local: valida estritamente contra os usuários cadastrados
    const users = getLocalUsers();
    const found = users.find(u => u.nome.trim().toLowerCase() === trimmedNome.toLowerCase());

    if (!found || found.passwordHash !== trimmedSenha) {
      throw new Error('Credenciais inválidas');
    }

    const mockToken = `local-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    setToken(mockToken);
    setUser({ nome: found.nome });
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify({ nome: found.nome }));
    sessionStorage.removeItem('logout_reason');
  };

  const register = async (newNome: string, newSenha: string): Promise<void> => {
    const trimmedNome = newNome.trim();
    const trimmedSenha = newSenha.trim();

    if (trimmedNome.length < 2) {
      throw new Error('Nome de usuário deve ter ao menos 2 caracteres');
    }
    if (trimmedSenha.length < 4) {
      throw new Error('A senha deve ter ao menos 4 caracteres');
    }

    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: trimmedNome, senha: trimmedSenha })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message || 'Erro ao registrar usuário');
        }
        const data = await res.json();
        setToken(data.token);
        setUser({ nome: data.nome });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({ nome: data.nome }));
        sessionStorage.removeItem('logout_reason');
        return;
      } catch (err: unknown) {
        const isNetworkErr = err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed'));
        if (!isNetworkErr) throw err;
        setIsStandalone(true);
      }
    }

    // Standalone Local
    const created = await createUser(trimmedNome, trimmedSenha);
    const mockToken = `local-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    setToken(mockToken);
    setUser({ nome: created.nome });
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify({ nome: created.nome }));
    sessionStorage.removeItem('logout_reason');
  };

  const listUsers = async (): Promise<UserItem[]> => {
    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 401) { logout(); throw new Error('Sessão expirada'); }
        if (!res.ok) throw new Error('Erro ao listar usuários');
        return await res.json();
      } catch (err) {
        if (!(err instanceof TypeError)) throw err;
      }
    }
    return getLocalUsers().map(u => ({ id: u.id, nome: u.nome }));
  };

  const createUser = async (newNome: string, newSenha: string): Promise<UserItem> => {
    const trimmed = newNome.trim();
    const trimmedSenha = newSenha.trim();
    if (trimmed.length < 2) {
      throw new Error('Nome de usuário deve ter ao menos 2 caracteres');
    }
    if (trimmedSenha.length < 4) {
      throw new Error('A senha deve ter ao menos 4 caracteres');
    }

    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nome: trimmed, senha: trimmedSenha })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message || 'Erro ao criar usuário');
        }
        return await res.json();
      } catch (err) {
        if (!(err instanceof TypeError)) throw err;
      }
    }

    // Fallback local: quando um novo usuário é cadastrado, qualquer usuário padrão/placeholder deixa de funcionar
    const currentUsers = getLocalUsers().filter(u => !isPlaceholderUser(u));
    if (currentUsers.some(u => u.nome.trim().toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Nome de usuário já cadastrado');
    }
    const newUser: LocalStoredUser = {
      id: Date.now(),
      nome: trimmed,
      passwordHash: trimmedSenha,
      isInitialPlaceholder: false
    };
    currentUsers.push(newUser);
    saveLocalUsers(currentUsers);
    return { id: newUser.id, nome: newUser.nome };
  };

  const updatePassword = async (id: number, novaSenha: string): Promise<void> => {
    const trimmedSenha = novaSenha.trim();
    if (trimmedSenha.length < 4) {
      throw new Error('A senha deve ter ao menos 4 caracteres');
    }

    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ senha: trimmedSenha })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as { message?: string }).message || 'Erro ao atualizar senha no servidor');
        }
      } catch (err) {
        if (!(err instanceof TypeError)) throw err;
      }
    }

    // Modo Standalone Local
    const users = getLocalUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Usuário não encontrado');
    target.passwordHash = trimmedSenha;
    target.isInitialPlaceholder = false;
    saveLocalUsers(users);
  };

  const deleteUser = async (id: number): Promise<void> => {
    const users = getLocalUsers();
    const target = users.find(u => u.id === id);
    if (!target) throw new Error('Usuário não encontrado');

    const wasSelf = Boolean(user && target.nome.toLowerCase() === user.nome.toLowerCase());

    if (API_BASE && !isStandalone) {
      try {
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as { message?: string }).message || 'Erro ao excluir usuário');
        }
      } catch (err) {
        if (!(err instanceof TypeError)) throw err;
      }
    }

    const updated = users.filter(u => u.id !== id);
    saveLocalUsers(updated);

    if (wasSelf) {
      logout();
    }
  };

  const hasRegisteredUsers = useCallback(() => {
    const users = getLocalUsers();
    return users.some(u => !isPlaceholderUser(u));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      listUsers,
      createUser,
      deleteUser,
      updatePassword,
      hasRegisteredUsers,
      apiBase: API_BASE,
      isStandaloneMode: isStandalone
    }}>
      {children}
    </AuthContext.Provider>
  );
};
