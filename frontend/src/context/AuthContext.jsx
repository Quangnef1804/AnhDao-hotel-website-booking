import { createContext, useContext, useMemo, useState } from 'react';
import { apiFetch } from '../api/client.js';

const AuthContext = createContext(null);

const storedUser = () => {
  try {
    if (!localStorage.getItem('anhdao_token')) return null;
    return JSON.parse(localStorage.getItem('anhdao_user'));
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);

  const persistSession = ({ user: nextUser, token }) => {
    localStorage.setItem('anhdao_user', JSON.stringify(nextUser));
    localStorage.setItem('anhdao_token', token);
    setUser(nextUser);
  };

  const login = async (payload) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    persistSession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('anhdao_user');
    localStorage.removeItem('anhdao_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
