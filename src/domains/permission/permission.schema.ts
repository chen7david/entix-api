import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';

/**
 * Permission table schema for Drizzle ORM.
 */
export const permissionsTable = pgTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // e.g., 'users:create', 'articles:publish'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    nameIdx: uniqueIndex('permissions_name_idx').on(table.name),
    // Unique constraint for name (non-deleted) will be handled by service layer or
    // a partial index if supported easily by Drizzle at a later stage.
  }),
);

/**
 * Zod schema for Permission entity (database representation)
 */
export const PermissionEntitySchema = createEntitySchema(permissionsTable, {
  name: 'PermissionEntity',
  description: 'Permission entity representing a database record',
});

/**
 * Type definition for Permission entity from database
 */
export type PermissionEntity = EntityType<typeof PermissionEntitySchema>;

/**
 * Zod schema for creating a new Permission (insert schema)
 */
export const CreatePermissionEntitySchema = createInsertEntitySchema(permissionsTable, {
  name: 'CreatePermissionEntity',
  description: 'Schema for creating a new permission entity',
});

/**
 * Type definition for creating a new Permission
 */
export type CreatePermissionEntity = EntityType<typeof CreatePermissionEntitySchema>;
