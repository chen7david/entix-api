import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTenantRoles } from '@domains/join-tables/user-tenant-roles.schema';

/**
 * User table schema for Drizzle ORM.
 */
export const users = pgTable(
  'users',
  {
    /** User ID (PK, auto-generated UUID) */
    id: uuid('id').defaultRandom().primaryKey(),
    /** Username */
    username: text('username').notNull().unique(),
    /** User email */
    email: text('email').notNull(),
    /** First name */
    firstName: text('first_name'),
    /** Last name */
    lastName: text('last_name'),
    /** Preferred language code (e.g., 'en-US') */
    preferredLanguage: text('preferred_language').default('en-US'),
    /** Cognito sub identifier */
    cognitoSub: text('cognito_sub').notNull().unique(),
    /** Tenant ID (for multi-tenant applications) */
    tenantId: uuid('tenant_id').references(() => tenants.id),
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
  },
  (table) => [
    // Indexes for commonly queried fields
    index('users_email_idx').on(table.email),
    // For username and cognitoSub we don't need explicit indexes
    // as unique constraints automatically create indexes
    index('users_is_disabled_idx').on(table.isDisabled),
    index('users_is_admin_idx').on(table.isAdmin),
    // Index for name searches
    index('users_name_idx').on(table.firstName, table.lastName),
    // Index for preferred language
    index('users_preferred_language_idx').on(table.preferredLanguage),
    // Index for tenant ID
    index('users_tenant_id_idx').on(table.tenantId),
    // Index for soft delete filtering
    index('users_deleted_at_idx').on(table.deletedAt),
  ],
);

/**
 * Drizzle ORM relations for users.
 */
export const usersRelations = relations(users, ({ many }) => ({
  userTenantRoles: many(userTenantRoles),
}));

// Need to import tenants after users definition to avoid circular references
import { tenants } from '@domains/tenant/tenant.schema';
