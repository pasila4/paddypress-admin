import { apiFetch } from './api';
import {
  AdminOrganizationResponseSchema,
  AdminOrganizationsListResponseSchema,
  CreateOrganizationRequestSchema,
  UpdateOrganizationRequestSchema,
} from '../types/adminOrganizations';
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '../types/adminOrganizations';

export async function listAdminOrganizations(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();

  if (typeof params.page === 'number')
    searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number')
    searchParams.set('limit', String(params.limit));
  if (params.search && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim());
  }

  const qs = searchParams.toString();
  const res = await apiFetch(`/admin/organizations${qs ? `?${qs}` : ''}`);

  const parsed = AdminOrganizationsListResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function createAdminOrganization(
  payload: CreateOrganizationRequest,
) {
  const validated = CreateOrganizationRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the organization details and try again.');

  const res = await apiFetch('/admin/organizations', {
    method: 'POST',
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminOrganizationResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function updateAdminOrganization(
  id: string,
  payload: UpdateOrganizationRequest,
) {
  const validated = UpdateOrganizationRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the organization details and try again.');

  const res = await apiFetch(`/admin/organizations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminOrganizationResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function deleteAdminOrganization(id: string) {
  const res = await apiFetch(`/admin/organizations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  // delete returns { success, data: null, message }
  if (typeof res !== 'object' || res === null || !('success' in res)) {
    throw new Error('Unexpected response from server.');
  }

  return res as { success: boolean; data: null; message?: string };
}
