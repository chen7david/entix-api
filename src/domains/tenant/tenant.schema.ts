import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roles } from '@domains/role/role.schema';
import { userTenantRoles } from '@domains/join-tables/user-tenant-roles.schema';

/**
 * Tenants table schema. Represents an organization or group.
 */
export const tenants = pgTable(
  'tenants',
  {
    /** Tenant ID (PK) */
    id: uuid('id').defaultRandom().primaryKey(),
    /** Tenant name */
    name: text('name').notNull().unique(),
    /** Tenant description */
    description: text('description'),
    /** Created at timestamp */
    createdAt: timestamp('created_at').defaultNow(),
    /** Updated at timestamp */
    updatedAt: timestamp('updated_at').defaultNow(),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // Index for soft delete filtering
    index('tenants_deleted_at_idx').on(table.deletedAt),
  ],
);

/**
 * Drizzle ORM relations for tenants.
 */
export const tenantsRelations = relations(tenants, ({ many }) => ({
  roles: many(roles),
  userTenantRoles: many(userTenantRoles),
}));
