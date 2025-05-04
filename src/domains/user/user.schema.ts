import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';

/**
 * User table schema for Drizzle ORM.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  username: text('username').notNull().unique(),
  password: text('password'),
  cognito_sub: text('cognito_sub'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

/**
 * Zod schema for User entity (database representation)
 */
export const UserEntitySchema = createEntitySchema(users, {
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
export const CreateUserEntitySchema = createInsertEntitySchema(users, {
  name: 'CreateUserEntity',
  description: 'Schema for creating a new user entity',
});

/**
 * Type definition for creating a new User
 */
export type CreateUserEntity = EntityType<typeof CreateUserEntitySchema>;
