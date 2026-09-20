/**
 * Admify API Client Configuration
 * 
 * Provides environment-based API base URL using Vite environment variables (VITE_API_URL).
 * Automatically attaches JWT authentication tokens from localStorage to protected requests.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to construct an absolute or relative endpoint URL
 * @param {string} endpoint 
 * @returns {string}
 */
export const getApiUrl = (endpoint = '') => {
  if (!API_BASE_URL) return endpoint;
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
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('admify_token');

  const headers = {
    'Content-Type': 'application/json',
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
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
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
  post: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
