import { apiFetch } from './api';
import {
  CropYearListResponseSchema,
  CropYearResponseSchema,
  CreateCropYearRequestSchema,
} from '../types/cropYears';
import type { CreateCropYearRequest } from '../types/cropYears';

export async function listCropYears(
  params: {
    page?: number;
    limit?: number;
    label?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();

  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page));
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.label && params.label.trim() !== '') {
    searchParams.set('label', params.label.trim());
  }

  const qs = searchParams.toString();
  const res = await apiFetch(`/admin/crop-years${qs ? `?${qs}` : ''}`);

  const parsed = CropYearListResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}

export async function getCropYear(id: string) {
  const res = await apiFetch(`/crop-years/${encodeURIComponent(id)}`);
  const parsed = CropYearResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }
  return parsed.data;
}

export async function createCropYear(payload: CreateCropYearRequest) {
  const parsedPayload = CreateCropYearRequestSchema.safeParse(payload);
  if (!parsedPayload.success) {
    throw new Error('Enter a valid start year.');
  }

  const res = await apiFetch('/admin/crop-years', {
    method: 'POST',
    body: JSON.stringify(parsedPayload.data),
  });

  const parsed = CropYearResponseSchema.safeParse(res);
  if (!parsed.success) {
    throw new Error('Unexpected response from server.');
  }

  return parsed.data;
}
