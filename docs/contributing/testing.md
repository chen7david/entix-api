# Testing Guide

## Test Setup

```bash
npm run test:init  # Initialize test environment
npm test          # Run tests
```

## Writing Tests

### Controller Tests

```typescript
describe('UserController', () => {
  it('should return users', async () => {
    // Test implementation
  });
});
```

### Service Tests

```typescript
describe('UserService', () => {
  it('should create user', async () => {
    // Test implementation
  });
});
```

### Database Tests

The project includes global setup files that handle database connections automatically during tests.
You don't need to explicitly connect or disconnect from the database in your test files.

```typescript
import { db } from '@src/db/db.client';
import { usersTable } from '@src/db/schema';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Reset data for isolation
    await db.delete(usersTable);
  });

  it('should save and retrieve data', async () => {
    // Your test implementation
  });
});
```

For detailed instructions on database testing, see the [Database Testing Guide](/setup/database.html#database-testing).

## Test Best Practices

1. Use meaningful test descriptions
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test edge cases
5. Maintain test isolation
