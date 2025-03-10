import { getDbConfig } from "@/db/connection.db";
import { env } from "@/config/env.config";
import { Pool } from "pg";
import { logger } from '@/services/logger.service';

const defaultDb = "postgres";
const pool = new Pool({
  ...getDbConfig(),
  database: defaultDb,
});

const testLogger = logger.setContext('TestSetup');

async function initTestDatabase() {
  const client = await pool.connect();

  try {
    const dbName = env.POSTGRES_DB;
    testLogger.info('Initializing test database', { dbName });

    // Check if this is a test database
    const isTestDB = dbName.includes("-test");
    if (!isTestDB) {
      testLogger.error('Invalid database name for tests', undefined, { dbName });
      throw new Error(
        'Safety check failed: Can only initialize databases with "-test" in the name'
      );
    }
    // Check if database exists
    const { rows } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    const isDBExist = rows.length > 0;

    // If database exists, disconnect users and drop it
    if (isDBExist) {
      testLogger.info('Dropping existing test database', { dbName });
      // Disconnect all users from the database
      await client.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `,
        [dbName]
      );

      // Drop the database
      await client.query(`DROP DATABASE IF EXISTS "${dbName}";`);
      console.log(`Dropped existing test database "${dbName}"`);
    }

    // Create a fresh database
    testLogger.info('Creating fresh test database', { dbName });
    await client.query(`CREATE DATABASE "${dbName}";`);
    console.log(`Test database "${dbName}" created successfully.`);
    
    testLogger.info('Test database initialization complete', { dbName });
  } catch (error) {
    testLogger.error('Test database initialization failed', error as Error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the initialization
initTestDatabase()
  .then(() => {
    testLogger.info("Test database initialization complete");
    process.exit(0);
  })
  .catch((error) => {
    testLogger.info("Test database initialization failed:", error);
    process.exit(1);
  });
