import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

// Format user object with backwards-compatible user_metadata for existing views
const formatUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    user_metadata: {
      full_name: rawUser.name || rawUser.user_metadata?.full_name || 'User',
      phone: rawUser.phone || rawUser.user_metadata?.phone || '',
      role: rawUser.role || rawUser.user_metadata?.role || 'student',
      ...(rawUser.user_metadata || {}),
    },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('admify_user');
      return cached ? formatUser(JSON.parse(cached)) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admify_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/me');
        if (res?.data?.user) {
          const formatted = formatUser(res.data.user);
          setUser(formatted);
          localStorage.setItem('admify_user', JSON.stringify(formatted));
        }
      } catch (err) {
        // If token is expired or unauthorized, clear session
        if (err.status === 401 || err.message?.includes('token')) {
          console.warn('Session expired. Logging out.');
          localStorage.removeItem('admify_token');
          localStorage.removeItem('admify_user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register method
  const register = async ({ name, email, password, phone, role }) => {
    const res = await api.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
      role,
    });
    return res;
  };

  // Standard login method
  const login = async (email, password, role) => {
    const res = await api.post('/api/auth/login', {
      email,
      password,
      role,
    });

    if (res?.data?.token) {
      localStorage.setItem('admify_token', res.data.token);
      const formatted = formatUser(res.data.user);
      localStorage.setItem('admify_user', JSON.stringify(formatted));
      setUser(formatted);
    }

    return res;
  };

  // Administrator login method
  const adminLogin = async (email, password) => {
    const res = await api.post('/api/auth/admin/login', {
      email,
      password,
    });

    if (res?.data?.token) {
      localStorage.setItem('admify_token', res.data.token);
      const formatted = formatUser(res.data.user);
      localStorage.setItem('admify_user', JSON.stringify(formatted));
      setUser(formatted);
    }

    return res;
  };

  // Sign out method
  const signOut = async () => {
    localStorage.removeItem('admify_token');
    localStorage.removeItem('admify_user');
    setUser(null);
  };

  // Update current user locally after profile edit
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = formatUser({ ...prev, ...updatedFields });
      localStorage.setItem('admify_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
