import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rolePermissions } from '@domains/join-tables/role-permissions.schema';

/**
 * Permissions table schema. Represents a permission that can be assigned to roles.
 * Uses a flat structure with unique names.
 */
export const permissions = pgTable(
  'permissions',
  {
    /** Permission ID (PK) */
    id: uuid('id').defaultRandom().primaryKey(),
    /** Permission name */
    name: text('name').unique().notNull(),
    /** Human-readable description of the permission */
    description: text('description'),
    /** Created at timestamp */
    createdAt: timestamp('created_at').defaultNow(),
    /** Updated at timestamp */
    updatedAt: timestamp('updated_at').defaultNow(),
    /** Soft delete timestamp */
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // No need for name index as unique constraint creates one automatically
    // Index for soft delete filtering
    index('permissions_deleted_at_idx').on(table.deletedAt),
  ],
);

/**
 * Drizzle ORM relations for permissions.
 */
export const permissionsRelations = relations(permissions, ({ many }) => ({
  // Many-to-many relation with roles through rolePermissions
  rolePermissions: many(rolePermissions),
}));
