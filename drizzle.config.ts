import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Get the database URL from the environment file.
 * - Loads env vars from .env
 * - Uses all schema files matching `./src/../..schema.ts`
 * - Outputs generated files to `./src/database/drizzle`
 * - Reads DB URL from `process.env.DATABASE_URL`
 */
function getDatabaseUrl() {
  const isTest = process.env.NODE_ENV === 'test';
  const envFile = isTest ? '.env.test' : '.env';
  const envFilePath = path.join(__dirname, envFile);

  dotenv.config({ path: envFilePath, override: true });

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  return databaseUrl;
}

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
  out: './src/database/migrations',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
