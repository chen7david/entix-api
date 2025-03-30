import { getPool } from '../pg.db';

/**
 * Integration tests for PostgreSQL database operations
 * These tests perform actual database operations
 */
describe('PostgreSQL Database Integration Tests', () => {
  // Test table name with random suffix to avoid conflicts
  const TEST_TABLE = `test_users_${Math.floor(Math.random() * 10000)}`;
  const pool = getPool();

  beforeAll(async () => {
    // Create test table
    await pool.query(`
      CREATE TABLE ${TEST_TABLE} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  afterAll(async () => {
    // Drop test table and close pool
    await pool.query(`DROP TABLE IF EXISTS ${TEST_TABLE}`);
    await pool.end();
  });

  afterEach(async () => {
    // Clean up data after each test
    await pool.query(`DELETE FROM ${TEST_TABLE}`);
  });

  describe('Basic CRUD Operations', () => {
    it('should insert a new record', async () => {
      const result = await pool.query(
        `INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2) RETURNING *`,
        ['John Doe', 'john@example.com'],
      );

      expect(result.rows[0]).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].created_at).toBeDefined();
    });

    it('should read inserted records', async () => {
      // Insert test data
      await pool.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
        'Jane Doe',
        'jane@example.com',
      ]);

      const result = await pool.query(`SELECT * FROM ${TEST_TABLE} WHERE email = $1`, [
        'jane@example.com',
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('should update existing records', async () => {
      // Insert test data
      const insertResult = await pool.query(
        `INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2) RETURNING id`,
        ['Bob Smith', 'bob@example.com'],
      );

      const id = insertResult.rows[0].id;

      // Update record
      await pool.query(`UPDATE ${TEST_TABLE} SET name = $1 WHERE id = $2`, ['Robert Smith', id]);

      // Verify update
      const result = await pool.query(`SELECT * FROM ${TEST_TABLE} WHERE id = $1`, [id]);

      expect(result.rows[0]).toMatchObject({
        name: 'Robert Smith',
        email: 'bob@example.com',
      });
    });

    it('should delete records', async () => {
      // Insert test data
      const insertResult = await pool.query(
        `INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2) RETURNING id`,
        ['Alice Brown', 'alice@example.com'],
      );

      const id = insertResult.rows[0].id;

      // Delete record
      await pool.query(`DELETE FROM ${TEST_TABLE} WHERE id = $1`, [id]);

      // Verify deletion
      const result = await pool.query(`SELECT * FROM ${TEST_TABLE} WHERE id = $1`, [id]);

      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Transaction Tests', () => {
    it('should successfully commit a transaction', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
          'Transaction User 1',
          'trans1@example.com',
        ]);

        await client.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
          'Transaction User 2',
          'trans2@example.com',
        ]);

        await client.query('COMMIT');

        // Verify both records were inserted
        const result = await client.query(`SELECT * FROM ${TEST_TABLE} ORDER BY id`);
        expect(result.rows).toHaveLength(2);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    });

    it('should successfully rollback a transaction on error', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
          'Rollback User 1',
          'rollback1@example.com',
        ]);

        // This should fail due to duplicate email
        await client.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
          'Rollback User 2',
          'rollback1@example.com',
        ]);

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        // Verify no records were inserted due to rollback
        const result = await client.query(`SELECT * FROM ${TEST_TABLE}`);
        expect(result.rows).toHaveLength(0);
      } finally {
        client.release();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle unique constraint violations', async () => {
      // Insert initial record
      await pool.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
        'Unique User',
        'unique@example.com',
      ]);

      // Attempt to insert duplicate email
      await expect(
        pool.query(`INSERT INTO ${TEST_TABLE} (name, email) VALUES ($1, $2)`, [
          'Another User',
          'unique@example.com',
        ]),
      ).rejects.toThrow();
    });

    it('should handle invalid queries', async () => {
      await expect(pool.query('SELECT * FROM non_existent_table')).rejects.toThrow();
    });
  });
});
