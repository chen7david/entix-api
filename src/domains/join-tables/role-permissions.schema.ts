import { pgTable, timestamp, primaryKey, uuid } from 'drizzle-orm/pg-core';
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
      .references(() => roles.id),
    /** Permission ID (FK to permissions.id) */
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);
