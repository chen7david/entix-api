import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { tenants } from '@domains/tenant/tenant.schema';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Zod schema for tenant creation.
 */
export const CreateTenantDto = z.object({
  /** Tenant name */
  name: z.string().min(3).max(50),
  /** Optional tenant description */
  description: z.string().max(200).optional(),
  /** Admin user details */
  adminUser: z.object({
    /** Admin username */
    username: z.string().min(3).max(50),
    /** Admin email */
    email: z.string().email(),
    /** Admin password */
    password: z.string().min(8),
    /** Optional admin first name */
    firstName: z.string().optional(),
    /** Optional admin last name */
    lastName: z.string().optional(),
  }),
});

/**
 * Zod schema for tenant update
 */
export const UpdateTenantDto = z.object({
  /** Updated tenant name */
  name: z.string().min(3).max(50).optional(),
  /** Updated tenant description */
  description: z.string().max(200).optional(),
});

/**
 * Zod schema for tenant response (API)
 */
export const TenantDto = createSelectSchema(tenants).omit({
  deletedAt: true,
});

/**
 * Zod schema for tenant ID path parameter (UUID)
 */
export const TenantIdParamDto = z.object({
  /** Tenant's unique identifier from path parameters. @example "b3e1..." */
  id: z.string().uuid(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type CreateTenantDto = z.infer<typeof CreateTenantDto>;
export type UpdateTenantDto = z.infer<typeof UpdateTenantDto>;
export type TenantDto = z.infer<typeof TenantDto>;
export type TenantIdParamDto = z.infer<typeof TenantIdParamDto>;

/**
 * Registers tenant-related Zod schemas with the OpenAPI registry.
 * @param registry - The OpenAPIRegistry instance to register schemas on.
 */
export function registerTenantSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreateTenantDto', CreateTenantDto);
  registry.register('UpdateTenantDto', UpdateTenantDto);
  registry.register('TenantDto', TenantDto);
  registry.register('TenantIdParamDto', TenantIdParamDto);
}
