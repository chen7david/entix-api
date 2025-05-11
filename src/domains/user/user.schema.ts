import { pgTable, uuid, text, timestamp, boolean, primaryKey, integer } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';
import { rolesTable } from '@domains/role/role.schema';

/**
 * User table schema for Drizzle ORM.
 */
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  username: text('username').notNull().unique(),
  password: text('password'),
  cognito_sub: text('cognito_sub').unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

/**
 * Zod schema for User entity (database representation)
 */
export const UserEntitySchema = createEntitySchema(usersTable, {
  name: 'UserEntity',
  description: 'User entity representing a database record',
});

/**
 * Type definition for User entity from database
 */
export type UserEntity = EntityType<typeof UserEntitySchema>;

/**
 * Zod schema for creating a new User (insert schema)
 */
export const CreateUserEntitySchema = createInsertEntitySchema(usersTable, {
  name: 'CreateUserEntity',
  description: 'Schema for creating a new user entity',
});

/**
 * Type definition for creating a new User
 */
export type CreateUserEntity = EntityType<typeof CreateUserEntitySchema>;

/**
 * UserRoles join table schema.
 * Links users to roles (many-to-many).
 */
export const userRolesTable = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  }),
);

/**
 * Zod schema for UserRole entity.
 */
export const UserRoleEntitySchema = createEntitySchema(userRolesTable, {
  name: 'UserRoleEntity',
  description: 'User-Role link entity',
});
export type UserRoleEntity = EntityType<typeof UserRoleEntitySchema>;

/**
 * Zod schema for creating a new UserRole link.
 */
export const CreateUserRoleEntitySchema = createInsertEntitySchema(userRolesTable, {
  name: 'CreateUserRoleEntity',
  description: 'Schema for linking a user to a role',
});
export type CreateUserRoleEntity = EntityType<typeof CreateUserRoleEntitySchema>;
