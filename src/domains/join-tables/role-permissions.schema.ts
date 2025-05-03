import { pgTable, timestamp, primaryKey, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roles } from '@domains/role/role.schema';
import { permissions } from '@domains/permission/permission.schema';

/**
 * Join table associating roles with permissions.
 * Implements many-to-many relationship between roles and permissions.
 */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    /** Role ID (FK to roles.id) */
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    /** Permission ID (FK to permissions.id) */
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // Primary key on composite columns
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    // Individual indexes for when querying by single columns
    index('role_permissions_role_id_idx').on(table.roleId),
    index('role_permissions_permission_id_idx').on(table.permissionId),
    // Index for soft delete filtering
    index('role_permissions_deleted_at_idx').on(table.deletedAt),
  ],
);

/**
 * Drizzle ORM relations for rolePermissions.
 */
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));
