import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, session } from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Mantiene la sesión del usuario (token + datos básicos).
 *
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 * - `login(username, password)` llama a POST /api/auth/login y guarda la sesión.
 * - `logout()` borra la sesión.
 * - Si cualquier petición recibe 401, la sesión se cierra automáticamente
 *   (ver api/client.js, evento `auth:unauthorized`).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.getUser());

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    session.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
