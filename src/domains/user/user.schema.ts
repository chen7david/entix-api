import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTenantRoles } from '@domains/join-tables/user-tenant-roles.schema';

/**
 * User table schema for Drizzle ORM.
 */
export const users = pgTable('users', {
  /** User ID (PK, auto-generated UUID) */
  id: uuid('id').defaultRandom().primaryKey(),
  /** Username */
  username: text('username').notNull().unique(),
  /** User email */
  email: text('email').notNull(),
  /** Cognito sub identifier */
  cognitoSub: text('cognito_sub').notNull(),
  /**
   * Indicates if the user is disabled (soft lockout).
   * Defaults to false (user is enabled).
   */
  isDisabled: boolean('is_disabled').notNull().default(false),
  /**
   * Indicates if the user is a global admin (bypasses all RBAC).
   * This should only be set manually via direct DB access for tech support.
   * Defaults to false.
   */
  isAdmin: boolean('is_admin').notNull().default(false),
  /** Created at timestamp */
  createdAt: timestamp('created_at').defaultNow(),
  /** Updated at timestamp */
  updatedAt: timestamp('updated_at').defaultNow(),
  /** Soft delete timestamp */
  deletedAt: timestamp('deleted_at'),
});

/**
 * Drizzle ORM relations for users.
 */
export const usersRelations = relations(users, ({ many }) => ({
  userTenantRoles: many(userTenantRoles),
}));
