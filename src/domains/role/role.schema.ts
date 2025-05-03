import { pgTable, text, timestamp, unique, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from '@domains/tenant/tenant.schema';
import { userTenantRoles } from '@domains/join-tables/user-tenant-roles.schema';
import { rolePermissions } from '@domains/join-tables/role-permissions.schema';

/**
 * Roles table schema. Represents a role within a tenant.
 */
export const roles = pgTable(
  'roles',
  {
    /** Role ID (PK) */
    id: uuid('id').defaultRandom().primaryKey(),
    /** Role name */
    name: text('name').notNull(),
    /** Tenant ID (FK to tenants.id) */
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    /** Created at timestamp */
    createdAt: timestamp('created_at').defaultNow(),
    /** Updated at timestamp */
    updatedAt: timestamp('updated_at').defaultNow(),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // Composite unique constraint for (tenant_id, name)
    unique('tenant_id_name_unique').on(table.tenantId, table.name),
    // Index for tenantId lookups (common query pattern)
    index('roles_tenant_id_idx').on(table.tenantId),
    // Index for soft delete filtering
    index('roles_deleted_at_idx').on(table.deletedAt),
  ],
);

/**
 * Drizzle ORM relations for roles.
 */
export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  userTenantRoles: many(userTenantRoles),
  rolePermissions: many(rolePermissions),
}));
