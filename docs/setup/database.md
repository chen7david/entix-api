# Database Configuration

## PostgreSQL Setup

The project uses PostgreSQL as its primary database.

### Dev Container Configuration

Database is automatically configured when using dev containers:

- Database name from `.env`
- Persistent storage in Docker volume
- Automatic test database creation

### Manual Configuration

1. Install PostgreSQL 13+
2. Create database user
3. Create main and test databases
4. Update `.env` configuration

## Database Testing

### Test Setup Files

The project includes global setup files that handle database connections during tests:

- `src/__tests__/global.setup.ts`: Contains the global `beforeAll` and `afterAll` hooks that manage database connections for all tests
- `postgres.config.ts`: Provides a specialized test configuration when `NODE_ENV=test`

### Connection Management

When writing tests that interact with the database, you don't need to manually manage database connections. The global setup takes care of:

1. Ensuring tests run against the test database (with `-test` in the name)
2. Opening database connections when needed
3. Properly closing all connections after all tests complete
4. Handling timeouts and connection errors gracefully

### Example: Writing Database Tests

Here's how to write tests that interact with the database:

```typescript
import { db } from '@src/db/db.client';
import { usersTable } from '@src/db/schema';
import { logger } from '@/services/logger.service';

const testLogger = logger.setContext('MyTest');

describe('My Database Test', () => {
  // No need to manage connections in beforeAll/afterAll

  beforeEach(async () => {
    // Reset data for test isolation if needed
    await db.delete(usersTable);
  });

  it('should insert and retrieve data', async () => {
    // Test data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
    };

    // Insert data
    await db.insert(usersTable).values(testUser);

    // Retrieve data
    const users = await db.select().from(usersTable);

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject(testUser);
  });
});
```

### Best Practices

1. **Don't manually connect/disconnect**: The global setup handles database connections and cleanup
2. **Use the test database**: Always run tests against the test database (`env.POSTGRES_DB` should include `-test`)
3. **Clean up after tests**: Use `beforeEach` to reset data for test isolation
4. **Handle transactions properly**: Release clients after using transactions
5. **Use logging**: Add contextual logging with the `logger` service for better debugging

### Utility Functions

The project provides utility functions for common database operations in tests:

```typescript
import { dropAllTables, runMigrations } from '@src/db/utils/db.utils';

// Drop all tables in the database
await dropAllTables();

// Run all migrations to set up schema
await runMigrations();
```

### Test Performance Optimization

- Tests use a smaller connection pool (max: 2) to avoid resource exhaustion
- Shorter idle timeout for test connections
- Automatic termination of hanging database operations after timeout
