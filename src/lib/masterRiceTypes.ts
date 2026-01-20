import { apiFetch } from './api';
import {
  MasterRiceTypeListResponseSchema,
  MasterRiceTypeResponseSchema,
} from '../types/masterRiceTypes';
import type { UpsertMasterRiceTypeRequest } from '../types/masterRiceTypes';

export async function listMasterRiceTypes(
  params: {
    search?: string;
    includeInactive?: boolean;
  } = {},
) {
  const searchParams = new URLSearchParams();

  if (params.search && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim());
  }

  if (typeof params.includeInactive === 'boolean') {
    searchParams.set('includeInactive', String(params.includeInactive));
  }

  const qs = searchParams.toString();
  const res = await apiFetch(`/master-data/rice-types${qs ? `?${qs}` : ''}`);
  const parsed = MasterRiceTypeListResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }
  return parsed.data;
}

export async function upsertMasterRiceType(
  code: string,
  payload: UpsertMasterRiceTypeRequest,
) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error('Enter a rice type code.');
  }

  const res = await apiFetch(
    `/admin/rice-types/${encodeURIComponent(normalizedCode)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  const parsed = MasterRiceTypeResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export async function deleteMasterRiceType(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error('Enter a rice type code.');
  }

  return apiFetch(`/admin/rice-types/${encodeURIComponent(normalizedCode)}`, {
    method: 'DELETE',
  });
}
