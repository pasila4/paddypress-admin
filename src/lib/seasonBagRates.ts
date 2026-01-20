import { apiFetch } from './api';
import { ApiError } from './api';
import { z } from 'zod';
import { ListSeasonBagRatesResponseSchema } from '../types/seasonBagRates';
import type {
  SeasonCode,
  UpsertSeasonBagRatesRequest,
} from '../types/seasonBagRates';

const LegacyBagSizeSchema = z.enum(['KG_40', 'KG_75', 'KG_100']);

const LegacySeasonBagRateSchema = z.object({
  id: z.string(),
  cropYearStartYear: z.number().int(),
  seasonCode: z.enum(['KHARIF', 'RABI']),
  riceType: z.object({
    code: z.string(),
    name: z.string(),
  }),
  bagSize: LegacyBagSizeSchema,
  rateRupees: z.number(),
});

const LegacyListSeasonBagRatesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(LegacySeasonBagRateSchema),
  }),
  message: z.string().optional(),
});

function normalizeSeasonBagRatesResponse(res: unknown) {
  const grouped = ListSeasonBagRatesResponseSchema.safeParse(res);
  if (grouped.success) return grouped.data;

  const legacy = LegacyListSeasonBagRatesResponseSchema.safeParse(res);
  if (!legacy.success) {
    throw new Error('Unexpected response from server.');
  }

  const byRiceTypeCode = new Map<
    string,
    {
      cropYearStartYear: number;
      seasonCode: SeasonCode;
      riceType: { code: string; name: string };
      rates: {
        KG_40: number | null;
        KG_75: number | null;
        KG_100: number | null;
      };
    }
  >();

  for (const item of legacy.data.data.items) {
    const existing = byRiceTypeCode.get(item.riceType.code) ?? {
      cropYearStartYear: item.cropYearStartYear,
      seasonCode: item.seasonCode as SeasonCode,
      riceType: item.riceType,
      rates: { KG_40: null, KG_75: null, KG_100: null },
    };

    existing.rates[item.bagSize] = item.rateRupees;
    byRiceTypeCode.set(item.riceType.code, existing);
  }

  return {
    success: legacy.data.success,
    data: {
      items: Array.from(byRiceTypeCode.values()),
    },
    message: legacy.data.message,
  };
}

function toLegacyUpsertPayload(payload: UpsertSeasonBagRatesRequest) {
  const items: Array<{
    riceTypeCode: string;
    bagSize: string;
    rateRupees: number;
  }> = [];
  for (const row of payload.rates) {
    items.push({
      riceTypeCode: row.riceTypeCode,
      bagSize: 'KG_40',
      rateRupees: row.rates.KG_40,
    });
    items.push({
      riceTypeCode: row.riceTypeCode,
      bagSize: 'KG_75',
      rateRupees: row.rates.KG_75,
    });
    items.push({
      riceTypeCode: row.riceTypeCode,
      bagSize: 'KG_100',
      rateRupees: row.rates.KG_100,
    });
  }

  return {
    cropYearStartYear: payload.cropYearStartYear,
    seasonCode: payload.seasonCode,
    rates: items,
  };
}

export async function listSeasonBagRates(params: {
  cropYearStartYear: number;
  seasonCode: SeasonCode;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set('cropYearStartYear', String(params.cropYearStartYear));
  searchParams.set('seasonCode', params.seasonCode);

  const qs = searchParams.toString();
  const res = await apiFetch(`/admin/season-bag-rates?${qs}`);

  return normalizeSeasonBagRatesResponse(res);
}

export async function upsertSeasonBagRates(
  payload: UpsertSeasonBagRatesRequest,
) {
  try {
    const res = await apiFetch('/admin/season-bag-rates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeSeasonBagRatesResponse(res);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      const legacyPayload = toLegacyUpsertPayload(payload);
      const res = await apiFetch('/admin/season-bag-rates', {
        method: 'POST',
        body: JSON.stringify(legacyPayload),
      });
      return normalizeSeasonBagRatesResponse(res);
    }
    throw err;
  }
}

export async function resetSeasonBagRates(params: {
  cropYearStartYear: number;
  seasonCode: SeasonCode;
  confirm: string;
}) {
  const res = await apiFetch('/admin/season-bag-rates/reset', {
    method: 'POST',
    body: JSON.stringify({
      cropYearStartYear: params.cropYearStartYear,
      seasonCode: params.seasonCode,
      confirm: params.confirm,
    }),
  });

  return normalizeSeasonBagRatesResponse(res);
}
