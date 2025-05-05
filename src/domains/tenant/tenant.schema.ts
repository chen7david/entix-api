import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';

/**
 * Tenant table schema for Drizzle ORM.
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

/**
 * Zod schema for Tenant entity (database representation).
 */
export const TenantEntitySchema = createEntitySchema(tenants, {
  name: 'TenantEntity',
  description: 'Tenant entity representing a database record',
});

/**
 * Type definition for Tenant entity from database.
 */
export type TenantEntity = EntityType<typeof TenantEntitySchema>;

/**
 * Zod schema for creating a new Tenant (insert schema).
 */
export const CreateTenantEntitySchema = createInsertEntitySchema(tenants, {
  name: 'CreateTenantEntity',
  description: 'Schema for creating a new tenant entity',
});

/**
 * Type definition for creating a new Tenant.
 */
export type CreateTenantEntity = EntityType<typeof CreateTenantEntitySchema>;

/**
 * Type for Tenant ID
 */
export type TenantId = string;
