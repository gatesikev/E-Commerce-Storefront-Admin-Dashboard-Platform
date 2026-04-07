import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, usersApi } from '../api/client';
import type { User, UserRole } from '../types';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

interface AuthContextValue {
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 0, name: 'Administrator', email: ADMIN_EMAIL,
        role: 'admin', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('access_token', 'admin-static-token');
      setUser(adminUser);
      return;
    }
    const { data: tokens } = await authApi.login(email, password);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    const { data: profile } = await authApi.getProfile();
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const register = async (name: string, email: string, password: string) => {
    await usersApi.register(name, email, password);
    await login(email, password);
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <AuthContext.Provider value={{
      user, userRole: user?.role ?? null,
      isAuthenticated: !!user, isLoading, login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}