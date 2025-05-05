import { z } from 'zod';

/**
 * Type definition for Tenant ID
 */
export type TenantId = string;

/**
 * Interface representing a Tenant in the application
 */
export interface Tenant {
  id: TenantId;
  name: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt?: Date | string | null;
}

/**
 * Zod validation schema for TenantId
 */
export const TenantIdSchema = z.string().uuid();

/**
 * Zod validation schema for a Tenant
 */
export const TenantSchema = z.object({
  id: TenantIdSchema,
  name: z.string().min(1).max(100),
  createdAt: z.union([z.date(), z.string().datetime(), z.null()]),
  updatedAt: z.union([z.date(), z.string().datetime(), z.null()]),
  deletedAt: z.union([z.date(), z.string().datetime(), z.null()]).optional(),
});
