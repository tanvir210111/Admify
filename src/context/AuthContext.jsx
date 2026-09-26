import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const AUTH_STORAGE_KEYS = [
  'admify_token',
  'admify_user',
  'admify_admin_token',
  'token',
  'auth_token',
  'accessToken',
  'user',
  'admin',
];

/**
 * Completely clears all authentication tokens, cached user objects,
 * and session state from both localStorage and sessionStorage.
 */
export const clearAuthStorage = () => {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
};

/**
 * Checks if a JWT string is well-formed and unexpired.
 * Safely parses the token payload without external dependencies.
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return false;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded) return false;

    if (decoded.exp && typeof decoded.exp === 'number') {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (decoded.exp <= nowInSeconds) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

// Format user object with backwards-compatible user_metadata for existing views
const formatUser = (rawUser) => {
  if (!rawUser) return null;
  const role = rawUser.role || rawUser.user_metadata?.role || 'student';
  return {
    ...rawUser,
    id: rawUser._id || rawUser.id,
    role,
    user_metadata: {
      full_name: rawUser.name || rawUser.user_metadata?.full_name || 'User',
      phone: rawUser.phone || rawUser.user_metadata?.phone || '',
      role,
      ...(rawUser.user_metadata || {}),
    },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('admify_token');
      if (!token || !isTokenValid(token)) {
        clearAuthStorage();
        return null;
      }
      const cached = localStorage.getItem('admify_user');
      return cached ? formatUser(JSON.parse(cached)) : null;
    } catch {
      clearAuthStorage();
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admify_token');
      if (!token || !isTokenValid(token)) {
        clearAuthStorage();
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
        } else {
          throw new Error('User profile could not be loaded');
        }
      } catch (err) {
        // If token is expired, unauthorized, or invalid, clear session
        if (err.status === 401 || err.status === 403 || err.message?.includes('token') || !isTokenValid(token)) {
          console.warn('Session expired or unauthorized. Logging out.');
          clearAuthStorage();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for unauthorized events emitted by API calls
    const handleUnauthorizedEvent = () => {
      clearAuthStorage();
      setUser(null);
    };

    window.addEventListener('admify_auth_unauthorized', handleUnauthorizedEvent);
    return () => {
      window.removeEventListener('admify_auth_unauthorized', handleUnauthorizedEvent);
    };
  }, []);

  // Register method
  const register = async ({ name, email, password, phone, role, ...extra }) => {
    const res = await api.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
      role,
      ...extra,
    });

    if (res?.data?.token) {
      clearAuthStorage();
      localStorage.setItem('admify_token', res.data.token);
      const formatted = formatUser(res.data.user);
      if (formatted) {
        localStorage.setItem('admify_user', JSON.stringify(formatted));
      }
      setUser(formatted);
    }

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
      clearAuthStorage();
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
      clearAuthStorage();
      localStorage.setItem('admify_token', res.data.token);
      const formatted = formatUser(res.data.user);
      localStorage.setItem('admify_user', JSON.stringify(formatted));
      setUser(formatted);
    }

    return res;
  };

  // Sign out method
  const signOut = async () => {
    clearAuthStorage();
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
    setUser,
    loading,
    login,
    adminLogin,
    register,
    signOut,
    updateUser,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
