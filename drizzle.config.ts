import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Drizzle configuration for PostgreSQL.
 * - Loads env vars from .env
 * - Uses all schema files matching `./src/../..schema.ts`
 * - Outputs generated files to `./src/database/drizzle`
 * - Reads DB URL from `process.env.DATABASE_URL`
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/*.schema.ts',
  out: './src/database/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
