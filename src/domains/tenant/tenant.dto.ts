import { z } from 'zod';
import { TenantIdSchema } from '@domains/tenant/tenant.model';

/**
 * DTO for creating a new tenant with an associated user
 */
export const CreateTenantDtoSchema = z.object({
  // Tenant details
  name: z.string().min(1).max(100),

  // User details for the initial tenant admin
  user: z
    .object({
      email: z.string().email(),
      username: z.string().min(3).max(50),
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export type CreateTenantDto = z.infer<typeof CreateTenantDtoSchema>;

/**
 * DTO for updating an existing tenant
 */
export const UpdateTenantDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type UpdateTenantDto = z.infer<typeof UpdateTenantDtoSchema>;

/**
 * DTO for tenant ID path parameter
 */
export const TenantIdParamDtoSchema = z.object({
  id: TenantIdSchema,
});

export type TenantIdParamDto = z.infer<typeof TenantIdParamDtoSchema>;

/**
 * DTO for responding with tenant data
 */
export const TenantDtoSchema = z.object({
  id: TenantIdSchema,
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TenantDto = z.infer<typeof TenantDtoSchema>;
