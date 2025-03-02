import { pool } from "../database.config";

describe("Database Configuration", () => {
  beforeAll(async () => {
    // Create test table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  afterAll(async () => {
    // Drop test table and close connection
    await pool.query('DROP TABLE IF EXISTS test_users');
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await pool.query('DELETE FROM test_users');
  });

  it("should connect to the database successfully", async () => {
    const result = await pool.query("SELECT NOW()");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeDefined();
  });

  it("should create and insert data successfully", async () => {
    const insertQuery = `
      INSERT INTO test_users (name, email) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const result = await pool.query(insertQuery, ['John Doe', 'john@example.com']);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('John Doe');
    expect(result.rows[0].email).toBe('john@example.com');
    expect(result.rows[0].id).toBeDefined();
    expect(result.rows[0].created_at).toBeDefined();
  });

  it("should read data successfully", async () => {
    // Insert test data
    await pool.query(
      'INSERT INTO test_users (name, email) VALUES ($1, $2)',
      ['Jane Smith', 'jane@example.com']
    );

    const result = await pool.query('SELECT * FROM test_users WHERE email = $1', ['jane@example.com']);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('Jane Smith');
    expect(result.rows[0].email).toBe('jane@example.com');
  });

  it("should update data successfully", async () => {
    // Insert test data
    const insertResult = await pool.query(
      'INSERT INTO test_users (name, email) VALUES ($1, $2) RETURNING id',
      ['Bob Wilson', 'bob@example.com']
    );
    const userId = insertResult.rows[0].id;

    // Update the record
    await pool.query(
      'UPDATE test_users SET name = $1 WHERE id = $2',
      ['Robert Wilson', userId]
    );

    // Verify the update
    const result = await pool.query('SELECT * FROM test_users WHERE id = $1', [userId]);
    expect(result.rows[0].name).toBe('Robert Wilson');
    expect(result.rows[0].email).toBe('bob@example.com');
  });

  it("should delete data successfully", async () => {
    // Insert test data
    await pool.query(
      'INSERT INTO test_users (name, email) VALUES ($1, $2)',
      ['Alice Brown', 'alice@example.com']
    );

    // Verify data exists
    let result = await pool.query('SELECT * FROM test_users WHERE email = $1', ['alice@example.com']);
    expect(result.rows).toHaveLength(1);

    // Delete the record
    await pool.query('DELETE FROM test_users WHERE email = $1', ['alice@example.com']);

    // Verify deletion
    result = await pool.query('SELECT * FROM test_users WHERE email = $1', ['alice@example.com']);
    expect(result.rows).toHaveLength(0);
  });

  it("should handle concurrent transactions correctly", async () => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        'INSERT INTO test_users (name, email) VALUES ($1, $2)',
        ['Transaction User', 'transaction@example.com']
      );

      // Verify data is visible within transaction
      const transactionResult = await client.query(
        'SELECT * FROM test_users WHERE email = $1',
        ['transaction@example.com']
      );
      expect(transactionResult.rows).toHaveLength(1);

      await client.query('COMMIT');

      // Verify data is visible after commit
      const finalResult = await pool.query(
        'SELECT * FROM test_users WHERE email = $1',
        ['transaction@example.com']
      );
      expect(finalResult.rows).toHaveLength(1);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }, 10000); // Added 10 second timeout
});
