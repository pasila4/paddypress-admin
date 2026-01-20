import { z } from 'zod';

export const SeasonCodeSchema = z.enum(['KHARIF', 'RABI']);
export type SeasonCode = z.infer<typeof SeasonCodeSchema>;

export const SeasonSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

export type Season = z.infer<typeof SeasonSchema>;

export const CropYearSchema = z.object({
  id: z.string(),
  label: z.string(),
  startYear: z.number().int(),
  seasons: z.array(SeasonSchema),
});

export type CropYear = z.infer<typeof CropYearSchema>;

export const CropYearListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(CropYearSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
  message: z.string().optional(),
});

export const CropYearResponseSchema = z.object({
  success: z.boolean(),
  data: CropYearSchema,
  message: z.string().optional(),
});

export const CreateCropYearRequestSchema = z.object({
  startYear: z
    .number()
    .int()
    .min(2000, 'Enter a valid year.')
    .max(3000, 'Enter a valid year.'),
});

export type CreateCropYearRequest = z.infer<typeof CreateCropYearRequestSchema>;
