export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000';

const RAW_PREFIX =
  (import.meta.env.VITE_API_PREFIX as string | undefined) ?? '/api';

export const API_PREFIX = RAW_PREFIX.startsWith('/')
  ? RAW_PREFIX
  : `/${RAW_PREFIX}`;

export const AUTH_STORAGE_KEY = 'auth_state';
export const LOGIN_REMEMBER_KEY = 'login_remember_state';

export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${p}`;
}
