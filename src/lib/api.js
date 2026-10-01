/**
 * Admify API Client Configuration
 * 
 * Provides environment-based API base URL using Vite environment variables (VITE_API_URL).
 * Automatically attaches JWT authentication tokens from tab-isolated sessionStorage to protected requests.
 */

// Automatically use local proxy or local backend when running on localhost / dev
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.'));

export const API_BASE_URL = isLocal
  ? ''
  : (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
    'https://api.admify.world';

/**
 * Helper to construct an absolute or relative endpoint URL
 * @param {string} endpoint 
 * @returns {string}
 */
export const getApiUrl = (endpoint = '') => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

/**
 * Standard fetch wrapper with automatic JWT token attachment and error parsing
 * @param {string} endpoint - API path (e.g. '/api/auth/login')
 * @param {RequestInit} options - fetch options
 */
export async function apiRequest(endpoint, options = {}) {
  let targetEndpoint = endpoint;
  if (options.params && typeof options.params === 'object') {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null && v !== '') {
        q.append(k, String(v));
      }
    }
    const qs = q.toString();
    if (qs) {
      targetEndpoint += (targetEndpoint.includes('?') ? '&' : '?') + qs;
    }
  }

  const url = getApiUrl(targetEndpoint);
  // Read active auth token strictly from tab-isolated sessionStorage
  const token =
    (typeof sessionStorage !== 'undefined' &&
      (sessionStorage.getItem('admify_token') || sessionStorage.getItem('token'))) ||
    null;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMsg = data?.message;
      if (res.status === 413) {
        errorMsg = data?.message || 'One or more uploaded documents are too large. Please reduce the file size and try again.';
      } else if (res.status === 401 && !errorMsg) {
        errorMsg = 'Invalid email or password.';
      } else if (!errorMsg) {
        errorMsg = `Request failed with status ${res.status}`;
      }
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;

      // If unauthorized on a protected endpoint, notify application to clear auth state
      // (Exclude temporary registration tokens, verification endpoints, and auth entry routes)
      if (
        res.status === 401 &&
        !endpoint.includes('/api/auth/login') &&
        !endpoint.includes('/api/auth/admin/login') &&
        !endpoint.includes('/api/auth/register') &&
        !endpoint.includes('/api/auth/activate-agency') &&
        !endpoint.includes('/api/agency/verification')
      ) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('admify_auth_unauthorized', {
              detail: { endpoint, status: res.status },
            })
          );
        }
      }

      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Unable to reach backend API at ${url}. Please verify that the API server is running and CORS is configured.`
      );
    }
    throw err;
  }
}

export const api = {
  baseUrl: API_BASE_URL,
  getApiUrl,
  request: apiRequest,
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => {
    const isFD = typeof FormData !== 'undefined' && body instanceof FormData;
    return apiRequest(endpoint, { ...options, method: 'POST', body: isFD ? body : JSON.stringify(body) });
  },
  put: (endpoint, body, options) => {
    const isFD = typeof FormData !== 'undefined' && body instanceof FormData;
    return apiRequest(endpoint, { ...options, method: 'PUT', body: isFD ? body : JSON.stringify(body) });
  },
  patch: (endpoint, body, options) => {
    const isFD = typeof FormData !== 'undefined' && body instanceof FormData;
    return apiRequest(endpoint, { ...options, method: 'PATCH', body: isFD ? body : JSON.stringify(body) });
  },
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
