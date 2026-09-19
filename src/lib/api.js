/**
 * Admify API Configuration
 * 
 * Provides environment-based API base URL using Vite environment variables.
 * Defaults to an empty string when the backend is not yet deployed,
 * keeping the frontend working smoothly without breaking the UI.
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

export default {
  baseUrl: API_BASE_URL,
  getApiUrl,
};
