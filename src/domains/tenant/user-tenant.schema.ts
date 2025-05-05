import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';
import { users } from '@domains/user/user.schema';
import { tenants } from '@domains/tenant/tenant.schema';

/**
 * User-Tenant join table schema.
 */
export const userTenants = pgTable('user_tenants', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  cognitoSub: text('cognito_sub'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schema for UserTenant entity (database representation).
 */
export const UserTenantEntitySchema = createEntitySchema(userTenants, {
  name: 'UserTenantEntity',
  description: 'UserTenant entity representing a database record',
});

/**
 * Type definition for UserTenant entity from database.
 */
export type UserTenantEntity = EntityType<typeof UserTenantEntitySchema>;

/**
 * Zod schema for creating a new UserTenant (insert schema).
 */
export const CreateUserTenantEntitySchema = createInsertEntitySchema(userTenants, {
  name: 'CreateUserTenantEntity',
  description: 'Schema for creating a new user-tenant relationship',
});

/**
 * Type definition for creating a new UserTenant.
 */
export type CreateUserTenantEntity = EntityType<typeof CreateUserTenantEntitySchema>;
