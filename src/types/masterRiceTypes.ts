import { z } from 'zod';

export const MasterRiceTypeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

export type MasterRiceType = z.infer<typeof MasterRiceTypeSchema>;

export const MasterRiceTypeListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(MasterRiceTypeSchema),
  }),
  message: z.string().optional(),
});

export type MasterRiceTypeListResponse = z.infer<
  typeof MasterRiceTypeListResponseSchema
>;

export const MasterRiceTypeResponseSchema = z.object({
  success: z.boolean(),
  data: MasterRiceTypeSchema,
  message: z.string().optional(),
});

export type MasterRiceTypeResponse = z.infer<
  typeof MasterRiceTypeResponseSchema
>;

export const UpsertMasterRiceTypeRequestSchema = z.object({
  name: z.string().min(1, 'Enter a name.'),
  isActive: z.boolean().optional(),
});

export type UpsertMasterRiceTypeRequest = z.infer<
  typeof UpsertMasterRiceTypeRequestSchema
>;
