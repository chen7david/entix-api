import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';
import { permissionsTable } from '@domains/permission/permission.schema';

/**
 * Role table schema for Drizzle ORM.
 */
export const rolesTable = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    nameIdx: uniqueIndex('roles_name_idx').on(table.name),
    // Add a unique constraint for name, but only for non-deleted roles
    // This requires a partial index, which might need raw SQL or specific Drizzle setup
    // For now, service layer will handle uniqueness check for non-deleted roles.
    // If Drizzle-ORM supports partial unique indexes directly, that would be better.
    // Example: uniqueIndex('roles_name_unique_when_not_deleted_idx').on(table.name).where(isNull(table.deletedAt))
  }),
);

/**
 * Zod schema for Role entity (database representation)
 */
export const RoleEntitySchema = createEntitySchema(rolesTable, {
  name: 'RoleEntity',
  description: 'Role entity representing a database record',
});

/**
 * Type definition for Role entity from database
 */
export type RoleEntity = EntityType<typeof RoleEntitySchema>;

/**
 * Zod schema for creating a new Role (insert schema)
 */
export const CreateRoleEntitySchema = createInsertEntitySchema(rolesTable, {
  name: 'CreateRoleEntity',
  description: 'Schema for creating a new role entity',
  // Omit option removed, as it's likely inferred or not supported in this utility
});

/**
 * Type definition for creating a new Role
 */
export type CreateRoleEntity = EntityType<typeof CreateRoleEntitySchema>;

/**
 * RolePermissions join table schema.
 * Links roles to permissions (many-to-many).
 */
export const rolePermissionsTable = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissionsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Composite primary key
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
);

/**
 * Zod schema for RolePermission entity.
 */
export const RolePermissionEntitySchema = createEntitySchema(rolePermissionsTable, {
  name: 'RolePermissionEntity',
  description: 'Role-Permission link entity',
});
export type RolePermissionEntity = EntityType<typeof RolePermissionEntitySchema>;

/**
 * Zod schema for creating a new RolePermission link.
 */
export const CreateRolePermissionEntitySchema = createInsertEntitySchema(rolePermissionsTable, {
  name: 'CreateRolePermissionEntity',
  description: 'Schema for linking a role to a permission',
});
export type CreateRolePermissionEntity = EntityType<typeof CreateRolePermissionEntitySchema>;
