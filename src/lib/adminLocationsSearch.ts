import { apiFetch } from './api';
import { z } from 'zod';

// --- Types ---

export const DistrictSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  stateName: z.string(),
  stateId: z.string(),
});

export type DistrictSearchResult = z.infer<typeof DistrictSearchResultSchema>;

export const MandalSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  districtName: z.string(),
  districtId: z.string(),
  stateName: z.string(),
  stateId: z.string(),
});

export type MandalSearchResult = z.infer<typeof MandalSearchResultSchema>;

export const VillageSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  mandalName: z.string(),
  mandalId: z.string(),
  districtName: z.string(),
  districtId: z.string(),
  stateName: z.string(),
  stateId: z.string(),
});

export type VillageSearchResult = z.infer<typeof VillageSearchResultSchema>;

const DistrictSearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DistrictSearchResultSchema),
});

const MandalSearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MandalSearchResultSchema),
});

const VillageSearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(VillageSearchResultSchema),
});

// --- API Functions ---

export async function searchDistrictsWithContext(
  query: string,
  limit = 20,
): Promise<DistrictSearchResult[]> {
  const qs = new URLSearchParams();
  if (query.trim()) qs.set('q', query.trim());
  qs.set('limit', String(limit));

  const res = await apiFetch(`/admin/locations/districts/search?${qs}`);
  const parsed = DistrictSearchResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data.data;
}

export async function searchMandalsWithContext(
  query: string,
  limit = 20,
): Promise<MandalSearchResult[]> {
  const qs = new URLSearchParams();
  if (query.trim()) qs.set('q', query.trim());
  qs.set('limit', String(limit));

  const res = await apiFetch(`/admin/locations/mandals/search?${qs}`);
  const parsed = MandalSearchResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data.data;
}

export async function searchVillagesWithContext(
  query: string,
  limit = 20,
): Promise<VillageSearchResult[]> {
  const qs = new URLSearchParams();
  if (query.trim()) qs.set('q', query.trim());
  qs.set('limit', String(limit));

  const res = await apiFetch(`/admin/locations/villages/search?${qs}`);
  const parsed = VillageSearchResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data.data;
}

export async function searchStatesWithContext(
  query: string,
  limit = 20,
): Promise<{ id: string; name: string }[]> {
  const qs = new URLSearchParams();
  if (query.trim()) qs.set('search', query.trim());
  qs.set('limit', String(limit));
  qs.set('includeInactive', 'false');

  const res = await apiFetch(`/admin/locations/states?${qs}`);
  const parsed = z
    .object({
      success: z.boolean(),
      data: z.object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          }),
        ),
      }),
    })
    .safeParse(res);

  if (!parsed.success) throw new Error('Unexpected response from server.');
  return parsed.data.data.items;
}
