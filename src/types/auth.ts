import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable().or(z.string()),
  organizationName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string(),
  role: z.enum(['ADMIN', 'MILLER', 'MANAGER', 'DRIVER']),
});

export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().min(1, 'Enter your email.'),
  password: z.string().min(1, 'Enter your password.'),
  portal: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: UserSchema,
  }),
  message: z.string().optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
