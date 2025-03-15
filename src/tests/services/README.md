# Database Test Service

This directory contains services for test utilities, including database testing helpers.

## DbTestService

The `DbTestService` provides utilities for creating, managing, and cleaning up test databases. This service is particularly useful for integration tests that require isolated database environments.

### Features

- Create test databases with random or custom names
- Automatically manage database connections and cleanup
- Safely isolate test data in separate databases
- Protect against accidental deletion of non-test databases

### Usage Example

```typescript
import { pool } from '@src/config/db.config';
import { DbTestService } from './db-test.service';

describe('Integration tests requiring database', () => {
  let dbService: DbTestService;
  let testDb: { name: string; pool: Pool };

  // Set up the service and create a test database
  beforeAll(async () => {
    // Create service with the main pool that has admin privileges
    dbService = new DbTestService(pool);

    // Create a database for these tests
    testDb = await dbService.createTestDatabase();

    // Create your schema, seed data, etc.
    await testDb.pool.query('CREATE TABLE test_table (id SERIAL PRIMARY KEY, name TEXT)');
  });

  // Clean up after all tests complete
  afterAll(async () => {
    // Clean up all databases created by this service
    await dbService.cleanupAllDatabases();
  });

  // Your tests...
  it('should perform database operations', async () => {
    // Use testDb.pool for database operations
    await testDb.pool.query('INSERT INTO test_table (name) VALUES ($1)', ['test name']);

    const result = await testDb.pool.query('SELECT * FROM test_table');
    expect(result.rows).toHaveLength(1);
  });
});
```

### Best Practices

1. **Use a unique test database for each test suite** to prevent test interference
2. **Always clean up test databases** after your tests complete
3. **Only create test databases** (the service enforces this by requiring "test" in the database name)
4. **Use parameterized queries** to prevent SQL injection

### API Documentation

See the TSDoc comments in `db-test.service.ts` for detailed API documentation.
