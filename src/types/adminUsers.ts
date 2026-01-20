import { z } from 'zod';

import { AdminRoleSchema } from './adminOrganizations';

export const AdminUserSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: AdminRoleSchema,
  isActive: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminUserResponseSchema = z.object({
  success: z.boolean(),
  data: AdminUserSchema,
  message: z.string().optional(),
});

export type AdminUserResponse = z.infer<typeof AdminUserResponseSchema>;

export const CreateMillerUserRequestSchema = z.object({
  organizationId: z.string().min(1, 'Select an organization.'),
  email: z.string().email('Enter a valid email address.'),
  firstName: z.string().min(1, 'Enter a first name.'),
  lastName: z.string().min(1, 'Enter a last name.'),
});

export type CreateMillerUserRequest = z.infer<
  typeof CreateMillerUserRequestSchema
>;

export const CreateMillerUserResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: AdminUserSchema,
    temporaryPassword: z.string(),
  }),
  message: z.string().optional(),
});

export type CreateMillerUserResponse = z.infer<
  typeof CreateMillerUserResponseSchema
>;

export const UpdateAdminUserRequestSchema = z.object({
  organizationId: z.string().min(1, 'Select an organization.').optional(),
  email: z.string().email('Enter a valid email address.').optional(),
  firstName: z.string().min(1, 'Enter a first name.').optional(),
  lastName: z.string().min(1, 'Enter a last name.').optional(),
  role: AdminRoleSchema.optional(),
  password: z
    .string()
    .min(8, 'Password must be between 8 and 64 characters.')
    .max(64, 'Password must be between 8 and 64 characters.')
    .optional(),
  emailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAdminUserRequest = z.infer<
  typeof UpdateAdminUserRequestSchema
>;

export const AdminUserTemporaryPasswordResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    temporaryPassword: z.string().nullable(),
  }),
  message: z.string().optional(),
});

export type AdminUserTemporaryPasswordResponse = z.infer<
  typeof AdminUserTemporaryPasswordResponseSchema
>;
