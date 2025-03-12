import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '@src/config/postgres.config';

// Create a Drizzle client instance using the existing pool
export const db = drizzle({ client: pool });
