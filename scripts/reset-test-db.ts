/**
 * Script to drop and recreate the test database before running tests.
 *
 * This script connects to the Postgres server, drops the test database if it exists,
 * and recreates it. It uses environment variables for connection details.
 *
 * Usage (in package.json):
 *   "db:reset:test": "ts-node scripts/reset-test-db.ts"
 *
 * @see https://node-postgres.com/
 */
import { Client } from 'pg';

const {
  PGUSER = 'postgres',
  PGPASSWORD = 'postgres',
  PGHOST = 'localhost',
  PGPORT = '5432',
  PGDATABASE = 'test-entix-api',
} = process.env;

const TEST_DB = PGDATABASE;
const SYSTEM_DB = 'postgres';

async function resetTestDb() {
  /**
   * Drops and recreates the test database.
   */
  const adminClient = new Client({
    user: PGUSER,
    password: PGPASSWORD,
    host: PGHOST,
    port: parseInt(PGPORT, 10),
    database: SYSTEM_DB,
  });

  try {
    await adminClient.connect();
    // Terminate all connections to the test DB
    await adminClient.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1;`,
      [TEST_DB],
    );
    // Drop the test DB if it exists
    await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB}";`);
    // Recreate the test DB
    await adminClient.query(`CREATE DATABASE "${TEST_DB}";`);
    // eslint-disable-next-line no-console
    console.log(`Test database '${TEST_DB}' has been reset.`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to reset test database:', error);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

resetTestDb();
