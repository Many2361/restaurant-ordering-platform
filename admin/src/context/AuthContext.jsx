import { createContext, useContext, useState } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('towa_admin_token');
    return token ? { token } : null;
  });

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('towa_admin_token', res.data.token);
    setAdmin(res.data.admin);
  };

  const logout = async () => {
    try { await apiLogout(); } catch (_) {}
    localStorage.removeItem('towa_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}