import { z } from 'zod';

export const RiceTypeRefSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

export const MasterRiceVarietySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  riceType: RiceTypeRefSchema,
});

export type MasterRiceVariety = z.infer<typeof MasterRiceVarietySchema>;

export const MasterRiceVarietyListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(MasterRiceVarietySchema),
  }),
  message: z.string().optional(),
});

export type MasterRiceVarietyListResponse = z.infer<
  typeof MasterRiceVarietyListResponseSchema
>;

export const MasterRiceVarietyResponseSchema = z.object({
  success: z.boolean(),
  data: MasterRiceVarietySchema,
  message: z.string().optional(),
});

export type MasterRiceVarietyResponse = z.infer<
  typeof MasterRiceVarietyResponseSchema
>;

export const UpsertMasterRiceVarietyRequestSchema = z.object({
  name: z.string().min(1, 'Enter a name.'),
  description: z.string().optional(),
  riceTypeCode: z.string().min(1, 'Select a rice type.'),
  isActive: z.boolean().optional(),
});

export type UpsertMasterRiceVarietyRequest = z.infer<
  typeof UpsertMasterRiceVarietyRequestSchema
>;
