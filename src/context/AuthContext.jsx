import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const AUTH_STORAGE_KEYS = [
  'admify_token',
  'admify_user',
  'admify_role',
  'admify_admin_token',
  'token',
  'auth_token',
  'accessToken',
  'user',
  'admin',
];

// Legacy keys that might be taking up space in localStorage from previous versions
export const LEGACY_AUTH_STORAGE_KEYS = [
  'admify_token',
  'admify_user',
  'admify_role',
  'admify_admin_token',
  'token',
  'auth_token',
  'accessToken',
  'user',
  'admin',
  'admify_student_documents',
  'admify_student_direct_apps',
  'admify_student_agency_requests',
  'admify_student_reports',
  'admify_student_saved_unis',
  'admify_student_compare_unis',
  'admify_ai_rec_assessment',
];

// Whitelist of allowed keys in localStorage (strictly safe user preferences only)
export const ALLOWED_LOCAL_STORAGE_KEYS = new Set([
  'admify_remembered_email',
  'admify_remembered_role',
]);

/**
 * Purge legacy auth tokens and large cached datasets from localStorage on application boot.
 * Guaranteed NEVER to delete remembered email or role preferences.
 * Does NOT call localStorage.clear().
 */
try {
  if (typeof localStorage !== 'undefined') {
    LEGACY_AUTH_STORAGE_KEYS.forEach((key) => {
      if (!ALLOWED_LOCAL_STORAGE_KEYS.has(key)) {
        localStorage.removeItem(key);
      }
    });
  }
} catch {
  // Ignore localStorage access failures (e.g. strict sandbox or private window)
}

/**
 * Completely clears all authentication tokens, cached user objects,
 * and session state from THIS TAB ONLY (sessionStorage).
 * Does NOT clear localStorage so other tabs' preferences are unaffected,
 * and does NOT broadcast logout to other tabs.
 */
export const clearAuthStorage = () => {
  try {
    if (typeof sessionStorage !== 'undefined') {
      AUTH_STORAGE_KEYS.forEach((key) => {
        sessionStorage.removeItem(key);
      });
    }
  } catch (e) {
    console.error('Error clearing tab auth storage:', e);
  }
};

/**
 * Defensive setter for sessionStorage items with quota error handling.
 */
export const safeSetSessionItem = (key, value) => {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[Storage Safety] Failed to set sessionStorage item '${key}':`, err?.message || err);
    return false;
  }
};

/**
 * Normalizes user object to a safe, lightweight authenticated identity payload.
 * Strictly excludes heavy documents, base64 blobs, and bloated collection arrays.
 */
export const sanitizeAuthUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== 'object') return null;

  const clean = { ...rawUser };

  delete clean.password;
  delete clean.activationTokenHash;
  delete clean.activationTokenExpires;
  delete clean.documents; // Never store base64/uploaded document blobs
  delete clean.verificationDocuments;
  delete clean.applicationDocuments;
  delete clean.chatMessages;
  delete clean.notifications;
  delete clean.auditLogs;
  delete clean.applications;
  delete clean.bids;

  // Defensive: Strip any large string values exceeding 2KB (e.g. stray base64 blobs)
  Object.keys(clean).forEach((k) => {
    if (typeof clean[k] === 'string' && clean[k].length > 2048) {
      delete clean[k];
    }
  });

  return clean;
};

/**
 * Defensive setter for admify_user with fallback to minimal identity if quota is exceeded.
 */
export const safeSetSessionUser = (userObj) => {
  if (!userObj || typeof sessionStorage === 'undefined') return;
  try {
    const sanitized = sanitizeAuthUser(userObj);
    sessionStorage.setItem('admify_user', JSON.stringify(sanitized));
  } catch (quotaErr) {
    console.warn('[Storage Safety] Quota exceeded while writing admify_user, falling back to minimal payload:', quotaErr?.message || quotaErr);
    try {
      const minimalUser = {
        id: userObj.id || userObj._id,
        _id: userObj._id || userObj.id,
        name: userObj.name || userObj.user_metadata?.full_name || 'User',
        email: userObj.email || '',
        role: userObj.role || 'student',
        status: userObj.status || 'active',
        accountStatus: userObj.accountStatus || 'ACTIVE',
        user_metadata: {
          full_name: userObj.name || userObj.user_metadata?.full_name || 'User',
          role: userObj.role || 'student',
        },
      };
      sessionStorage.setItem('admify_user', JSON.stringify(minimalUser));
    } catch (fallbackErr) {
      console.error('[Storage Safety] Critical: Could not write fallback minimal user to sessionStorage:', fallbackErr);
    }
  }
};

/**
 * Checks if a JWT string is well-formed and unexpired.
 * Safely parses the token payload without external dependencies.
 */
export const decodeTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
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
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  const decoded = decodeTokenPayload(token);
  if (!decoded) return false;
  if (decoded.exp && typeof decoded.exp === 'number') {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp <= nowInSeconds) {
      return false;
    }
  }
  return true;
};

// Format user object with backwards-compatible user_metadata for existing views
export const formatUser = (rawUser, token = null) => {
  if (!rawUser) return null;
  const sanitized = sanitizeAuthUser(rawUser);
  const decoded = token ? decodeTokenPayload(token) : null;
  // Canonical role: Backend user role takes highest precedence, then JWT token payload role, then metadata
  const role = (
    sanitized.role ||
    decoded?.role ||
    sanitized.user_metadata?.role ||
    'student'
  )
    .toString()
    .toLowerCase()
    .trim();

  const id = sanitized._id || sanitized.id || decoded?.id;

  return {
    ...sanitized,
    id,
    _id: id,
    role,
    user_metadata: {
      full_name: sanitized.name || sanitized.user_metadata?.full_name || 'User',
      phone: sanitized.phone || sanitized.user_metadata?.phone || '',
      role,
      ...(sanitized.user_metadata || {}),
    },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      const token = sessionStorage.getItem('admify_token') || sessionStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        clearAuthStorage();
        return null;
      }
      const cached = sessionStorage.getItem('admify_user');
      return cached ? formatUser(JSON.parse(cached), token) : null;
    } catch {
      clearAuthStorage();
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof sessionStorage === 'undefined') {
        setLoading(false);
        return;
      }
      const token = sessionStorage.getItem('admify_token') || sessionStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        clearAuthStorage();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/me');
        if (res?.data?.user) {
          const formatted = formatUser(res.data.user, token);
          setUser(formatted);
          safeSetSessionUser(formatted);
          safeSetSessionItem('admify_role', formatted.role);
        } else {
          throw new Error('User profile could not be loaded');
        }
      } catch (err) {
        // If token is expired, unauthorized, or invalid, clear session for this tab only
        if (err.status === 401 || err.status === 403 || err.message?.includes('token') || !isTokenValid(token)) {
          console.warn('[Tab Auth] Session expired or unauthorized for this tab. Logging out.');
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
    clearAuthStorage();
    setUser(null);

    const res = await api.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
      role,
      ...extra,
    });

    const token = res?.data?.token || res?.token;
    const rawUser = res?.data?.user || res?.user;

    if (token && rawUser) {
      clearAuthStorage();
      safeSetSessionItem('admify_token', token);
      safeSetSessionItem('token', token);
      const formatted = formatUser(rawUser, token);
      if (formatted) {
        safeSetSessionUser(formatted);
        safeSetSessionItem('admify_role', formatted.role);
      }
      setUser(formatted);
    }

    return res;
  };

  // Standard login method
  const login = async (email, password, role) => {
    // Purge previous auth session for THIS TAB ONLY
    clearAuthStorage();
    setUser(null);

    const res = await api.post('/api/auth/login', {
      email,
      password,
      role,
    });

    const token = res?.data?.token || res?.token;
    const rawUser = res?.data?.user || res?.user;

    if (!res || res.success === false || !token || !rawUser) {
      const err = new Error(res?.message || 'Invalid email or password.');
      err.status = res?.status || (res?.success === false ? 401 : 500);
      err.data = res;
      throw err;
    }

    // Tab-scoped storage: save active authentication session in sessionStorage ONLY
    clearAuthStorage();
    safeSetSessionItem('admify_token', token);
    safeSetSessionItem('token', token);
    const formatted = formatUser(rawUser, token);
    safeSetSessionUser(formatted);
    safeSetSessionItem('admify_role', formatted.role);
    setUser(formatted);

    return { ...res, user: formatted, role: formatted.role };
  };

  // Administrator login method
  const adminLogin = async (email, password) => {
    clearAuthStorage();
    setUser(null);

    const res = await api.post('/api/auth/admin/login', {
      email,
      password,
    });

    const token = res?.data?.token || res?.token;
    const rawUser = res?.data?.user || res?.user;

    if (!res || res.success === false || !token || !rawUser) {
      const err = new Error(res?.message || 'Invalid administrator credentials');
      err.status = res?.status || (res?.success === false ? 401 : 500);
      err.data = res;
      throw err;
    }

    // Tab-scoped storage: save active authentication session in sessionStorage ONLY
    clearAuthStorage();
    safeSetSessionItem('admify_token', token);
    safeSetSessionItem('token', token);
    const formatted = formatUser(rawUser, token);
    safeSetSessionUser(formatted);
    safeSetSessionItem('admify_role', formatted.role);
    setUser(formatted);

    return { ...res, user: formatted, role: formatted.role };
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
      safeSetSessionUser(updated);
      safeSetSessionItem('admify_role', updated.role);
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
