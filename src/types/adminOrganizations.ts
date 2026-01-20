import { z } from 'zod';

export const AdminRoleSchema = z.enum(['ADMIN', 'MILLER', 'MANAGER', 'DRIVER']);
export type AdminRole = z.infer<typeof AdminRoleSchema>;

export const AdminOrgUserSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: AdminRoleSchema,
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminOrgUser = z.infer<typeof AdminOrgUserSchema>;

export const AdminOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string().nullable(),
  district: z.string().nullable(),
  village: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  users: z.array(AdminOrgUserSchema),
});

export type AdminOrganization = z.infer<typeof AdminOrganizationSchema>;

export const AdminOrganizationsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(AdminOrganizationSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
  message: z.string().optional(),
});

export type AdminOrganizationsListResponse = z.infer<
  typeof AdminOrganizationsListResponseSchema
>;

export const AdminOrganizationResponseSchema = z.object({
  success: z.boolean(),
  data: AdminOrganizationSchema,
  message: z.string().optional(),
});

export type AdminOrganizationResponse = z.infer<
  typeof AdminOrganizationResponseSchema
>;

export const CreateOrganizationRequestSchema = z.object({
  name: z.string().min(2, 'Enter an organization name.'),
  state: z.string().min(1, 'Enter a state.'),
  district: z.string().min(1, 'Enter a district.'),
  village: z.string().min(1, 'Enter a village.'),
});

export type CreateOrganizationRequest = z.infer<
  typeof CreateOrganizationRequestSchema
>;

export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(2, 'Enter an organization name.').optional(),
  state: z.string().min(1, 'Enter a state.').optional(),
  district: z.string().min(1, 'Enter a district.').optional(),
  village: z.string().min(1, 'Enter a village.').optional(),
});

export type UpdateOrganizationRequest = z.infer<
  typeof UpdateOrganizationRequestSchema
>;
