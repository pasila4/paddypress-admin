import { apiFetch } from './api';
import {
  MasterRiceVarietyListResponseSchema,
  MasterRiceVarietyResponseSchema,
} from '../types/masterRiceVarieties';
import type { UpsertMasterRiceVarietyRequest } from '../types/masterRiceVarieties';

export async function listMasterRiceVarieties(
  params: {
    search?: string;
    riceTypeCode?: string;
    includeInactive?: boolean;
  } = {},
) {
  const searchParams = new URLSearchParams();

  if (params.search && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim());
  }

  if (params.riceTypeCode && params.riceTypeCode.trim() !== '') {
    searchParams.set('riceTypeCode', params.riceTypeCode.trim());
  }

  if (typeof params.includeInactive === 'boolean') {
    searchParams.set('includeInactive', String(params.includeInactive));
  }

  const qs = searchParams.toString();
  const res = await apiFetch(
    `/master-data/rice-varieties${qs ? `?${qs}` : ''}`,
  );

  const parsed = MasterRiceVarietyListResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export async function createMasterRiceVariety(
  payload: UpsertMasterRiceVarietyRequest,
) {
  const res = await apiFetch('/admin/rice-varieties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const parsed = MasterRiceVarietyResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export async function updateMasterRiceVariety(
  id: string,
  payload: UpsertMasterRiceVarietyRequest,
) {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error('Select a rice variety.');
  }

  const res = await apiFetch(
    `/admin/rice-varieties/${encodeURIComponent(trimmed)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  const parsed = MasterRiceVarietyResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export async function deleteMasterRiceVariety(id: string) {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error('Select a rice variety.');
  }

  return apiFetch(`/admin/rice-varieties/${encodeURIComponent(trimmed)}`, {
    method: 'DELETE',
  });
}
