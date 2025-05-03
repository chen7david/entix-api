import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Permissions table schema. Represents a permission that can be assigned to roles.
 */
export const permissions = pgTable('permissions', {
  /** Permission ID (PK) */
  id: uuid('id').defaultRandom().primaryKey(),
  /** Permission name */
  name: text('name').unique().notNull(),
  /** Created at timestamp */
  createdAt: timestamp('created_at').defaultNow(),
  /** Updated at timestamp */
  updatedAt: timestamp('updated_at').defaultNow(),
  /** Soft delete timestamp */
  deletedAt: timestamp('deleted_at'),
});
