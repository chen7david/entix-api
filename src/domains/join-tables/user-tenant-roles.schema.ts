import { pgTable, timestamp, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '@domains/user/user.schema';
import { tenants } from '@domains/tenant/tenant.schema';
import { roles } from '@domains/role/role.schema';

/**
 * Join table associating users with roles within a tenant.
 * Allows multiple roles per user per tenant.
 */
export const userTenantRoles = pgTable(
  'user_tenant_roles',
  {
    /** User ID (FK to users.id) */
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    /** Tenant ID (FK to tenants.id) */
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    /** Role ID (FK to roles.id) */
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    /** Created at timestamp */
    createdAt: timestamp('created_at').defaultNow(),
    /** Updated at timestamp */
    updatedAt: timestamp('updated_at').defaultNow(),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [primaryKey({ columns: [table.userId, table.tenantId, table.roleId] })],
);

/**
 * Drizzle ORM relations for userTenantRoles.
 */
export const userTenantRolesRelations = relations(userTenantRoles, ({ one }) => ({
  user: one(users, {
    fields: [userTenantRoles.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [userTenantRoles.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [userTenantRoles.roleId],
    references: [roles.id],
  }),
}));
