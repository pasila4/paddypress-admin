import { z } from 'zod';

export const BagSizeSchema = z.enum(['KG_40', 'KG_75', 'KG_100']);
export type BagSize = z.infer<typeof BagSizeSchema>;

export const SeasonCodeSchema = z.enum(['KHARIF', 'RABI']);
export type SeasonCode = z.infer<typeof SeasonCodeSchema>;

export const SeasonBagRateRatesBySizeSchema = z.object({
  KG_40: z.number().nullable(),
  KG_75: z.number().nullable(),
  KG_100: z.number().nullable(),
});

export const SeasonBagRateSchema = z.object({
  cropYearStartYear: z.number().int(),
  seasonCode: SeasonCodeSchema,
  riceType: z.object({
    code: z.string(),
    name: z.string(),
  }),
  rates: SeasonBagRateRatesBySizeSchema,
});

export type SeasonBagRate = z.infer<typeof SeasonBagRateSchema>;

export const ListSeasonBagRatesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(SeasonBagRateSchema),
  }),
  message: z.string().optional(),
});

export type ListSeasonBagRatesResponse = z.infer<
  typeof ListSeasonBagRatesResponseSchema
>;

export const UpsertSeasonBagRatesRequestSchema = z.object({
  cropYearStartYear: z.number().int(),
  seasonCode: SeasonCodeSchema,
  rates: z
    .array(
      z.object({
        riceTypeCode: z.string().min(1),
        rates: z.object({
          KG_40: z.number().min(0, 'Enter a valid rate.'),
          KG_75: z.number().min(0, 'Enter a valid rate.'),
          KG_100: z.number().min(0, 'Enter a valid rate.'),
        }),
      }),
    )
    .min(1, 'Add at least one rate.'),
});

export type UpsertSeasonBagRatesRequest = z.infer<
  typeof UpsertSeasonBagRatesRequestSchema
>;
