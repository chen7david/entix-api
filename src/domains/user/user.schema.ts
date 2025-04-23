import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * User table schema for Drizzle ORM.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
