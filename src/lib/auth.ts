import { apiFetch, setAuthToken } from './api';
import type { LoginRequest } from '../types/auth';
import { LoginResponseSchema } from '../types/auth';

export async function loginApi(payload: LoginRequest) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const parsed = LoginResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export function applyToken(token: string | null) {
  setAuthToken(token);
}
