import { useMutation } from '@tanstack/react-query';
import * as React from 'react';

import { setOnUnauthorized } from '../lib/api';
import { applyToken, loginApi } from '../lib/auth';
import { useAuthStore, useUiStore } from '../store';
import type { User } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useUiStore();

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const lastAppliedTokenRef = React.useRef<string | null>(null);
  if (token !== lastAppliedTokenRef.current) {
    applyToken(token);
    lastAppliedTokenRef.current = token;
  }

  const loginMutation = useMutation({
    mutationFn: loginApi,
  });

  React.useEffect(() => {
    setOnUnauthorized(() => {
      clearSession();
      showToast('Session expired. Please sign in again.', 'warning');
    });
    return () => setOnUnauthorized(null);
  }, [clearSession, showToast]);

  const isAuthenticated = Boolean(token);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated,
      async login(email, password, remember) {
        const res = await loginMutation.mutateAsync({
          email,
          password,
          portal: 'admin',
        });

        applyToken(res.data.token);
        setSession(
          {
            token: res.data.token,
            user: res.data.user,
          },
          remember,
        );
      },
      logout() {
        clearSession();
      },
    }),
    [
      clearSession,
      isAuthenticated,
      loginMutation,
      setSession,
      showToast,
      token,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
