import { apiFetch } from './api';
import {
  AdminByProductResponseSchema,
  AdminByProductsListResponseSchema,
  CreateAdminByProductRequestSchema,
  UpdateAdminByProductRequestSchema,
  type CreateAdminByProductRequest,
  type UpdateAdminByProductRequest,
} from '../types/adminByProducts';

export async function listAdminByProducts(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (typeof params.page === 'number')
    searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number')
    searchParams.set('limit', String(params.limit));
  if (params.search && params.search.trim() !== '')
    searchParams.set('search', params.search.trim());
  if (typeof params.includeInactive === 'boolean') {
    searchParams.set('includeInactive', String(params.includeInactive));
  }

  const qs = searchParams.toString();
  const res = await apiFetch(`/admin/by-products${qs ? `?${qs}` : ''}`);
  const parsed = AdminByProductsListResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function createAdminByProduct(
  payload: CreateAdminByProductRequest,
) {
  const validated = CreateAdminByProductRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the by-product details and try again.');

  const res = await apiFetch('/admin/by-products', {
    method: 'POST',
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminByProductResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function updateAdminByProduct(
  id: string,
  payload: UpdateAdminByProductRequest,
) {
  const validated = UpdateAdminByProductRequestSchema.safeParse(payload);
  if (!validated.success)
    throw new Error('Check the by-product details and try again.');

  const res = await apiFetch(`/admin/by-products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminByProductResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}

export async function deactivateAdminByProduct(id: string) {
  const res = await apiFetch(`/admin/by-products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  const parsed = AdminByProductResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data;
}
