import { create } from 'zustand';

import { AUTH_STORAGE_KEY } from '../config';
import type { User } from '../types/auth';

interface AuthSession {
  token: string;
  user: User;
}

interface AuthStoreState {
  token: string | null;
  user: User | null;
  setSession: (session: AuthSession, remember: boolean) => void;
  clearSession: () => void;
}

function readStoredAuth(): AuthSession | null {
  const read = (storage: Storage): AuthSession | null => {
    try {
      const raw = storage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { token?: unknown; user?: unknown };
      if (typeof parsed?.token !== 'string') return null;
      if (!parsed?.user || typeof parsed.user !== 'object') return null;
      return { token: parsed.token, user: parsed.user as User };
    } catch {
      return null;
    }
  };

  return read(localStorage) ?? read(sessionStorage);
}

function writeStoredAuth(session: AuthSession | null, remember: boolean) {
  const persistent = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  other.removeItem(AUTH_STORAGE_KEY);
  persistent.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

const initial = (() => {
  if (typeof window === 'undefined') {
    return { token: null as string | null, user: null as User | null };
  }
  const stored = readStoredAuth();
  return { token: stored?.token ?? null, user: stored?.user ?? null };
})();

export const useAuthStore = create<AuthStoreState>((set) => ({
  token: initial.token,
  user: initial.user,
  setSession: (session, remember) => {
    writeStoredAuth(session, remember);
    set({ token: session.token, user: session.user });
  },
  clearSession: () => {
    writeStoredAuth(null, false);
    set({ token: null, user: null });
  },
}));
