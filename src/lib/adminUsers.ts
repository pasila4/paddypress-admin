import { apiFetch } from './api';
import {
  AdminUserResponseSchema,
  AdminUserTemporaryPasswordResponseSchema,
  CreateMillerUserRequestSchema,
  CreateMillerUserResponseSchema,
  UpdateAdminUserRequestSchema,
} from '../types/adminUsers';
import type {
  CreateMillerUserRequest,
  UpdateAdminUserRequest,
} from '../types/adminUsers';

export async function createMillerUser(payload: CreateMillerUserRequest) {
  const validated = CreateMillerUserRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the user details and try again.');

  const res = await apiFetch('/admin/users/miller', {
    method: 'POST',
    body: JSON.stringify(validated.data),
  });

  const parsed = CreateMillerUserResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserRequest,
) {
  const validated = UpdateAdminUserRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the user details and try again.');

  const res = await apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminUserResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function deactivateAdminUser(id: string) {
  const res = await apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (typeof res !== 'object' || res === null || !('success' in res)) {
    throw new Error('Unexpected response from server.');
  }

  return res as { success: boolean; data: null; message?: string };
}

export async function getAdminUserTemporaryPassword(id: string) {
  const res = await apiFetch(
    `/admin/users/${encodeURIComponent(id)}/temporary-password`,
  );
  const parsed = AdminUserTemporaryPasswordResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}
