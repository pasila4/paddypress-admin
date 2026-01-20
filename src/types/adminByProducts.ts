import { z } from 'zod';

export const AdminByProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminByProduct = z.infer<typeof AdminByProductSchema>;

export const AdminByProductResponseSchema = z.object({
  success: z.boolean(),
  data: AdminByProductSchema,
  message: z.string().optional(),
});

export type AdminByProductResponse = z.infer<
  typeof AdminByProductResponseSchema
>;

export const AdminByProductsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(AdminByProductSchema),
    total: z.number().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
  }),
  message: z.string().optional(),
});

export type AdminByProductsListResponse = z.infer<
  typeof AdminByProductsListResponseSchema
>;

export const CreateAdminByProductRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateAdminByProductRequest = z.infer<
  typeof CreateAdminByProductRequestSchema
>;

export const UpdateAdminByProductRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAdminByProductRequest = z.infer<
  typeof UpdateAdminByProductRequestSchema
>;
