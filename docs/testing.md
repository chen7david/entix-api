# Testing Guidelines

This document outlines the testing principles, conventions, and best practices for the Entix API project.

## Testing Philosophy

Our testing strategy is built on several key principles:

1. **Test Behavior, Not Implementation**: Focus on testing the behavior of components rather than their internal implementation details.
2. **Arrange, Act, Assert**: Structure tests using the Arrange-Act-Assert pattern to improve readability and maintainability.
3. **Isolation**: Each test should run independently of others, ensuring consistent and reliable results.
4. **Maintainability**: Tests should be easy to understand and maintain as the codebase evolves.
5. **Coverage**: Strive for high test coverage, but prioritize meaningful tests over achieving specific coverage metrics.

## Testing Structure

### Mocking Dependencies

All mocks should be declared at the top of the test file, before any imports. This is important because:

1. Jest hoists mock declarations (`jest.mock()`) to the top of the file during execution
2. Mocking after the imports can lead to unexpected behavior
3. Having mocks at the top makes it clear what dependencies are being mocked

Example:

```typescript
// Mock dependencies before imports
jest.mock('@src/services/logger/logger.service', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

// Now import modules that might use the mocked dependencies
import { SomeService } from './some.service';
```

### Test File Organization

Test files should follow this organization:

1. **Imports and Mocks**: First mock dependencies, then import modules.
2. **Describe Blocks**: Group tests by component/feature.
3. **Setup and Teardown**: Use `beforeEach`, `afterEach`, etc. where appropriate.
4. **Test Cases**: Individual `it` or `test` functions.

Example:

```typescript
// Mock dependencies
jest.mock('dependency');

// Imports
import { SomeComponent } from './some.component';

describe('SomeComponent', () => {
  // Setup
  let component: SomeComponent;

  beforeEach(() => {
    component = new SomeComponent();
  });

  // Test groups
  describe('someMethod', () => {
    it('should handle valid input correctly', () => {
      // Arrange
      const input = 'valid';

      // Act
      const result = component.someMethod(input);

      // Assert
      expect(result).toBe(true);
    });
  });
});
```

### Naming Conventions

- **Test Files**: Name files `[component-name].test.ts`
- **Describe Blocks**: Use the component/function name, e.g., `describe('UserService', ...)`
- **Test Cases**: Use clear, descriptive phrases that explain what is being tested, e.g., `it('should return true when user is authenticated', ...)`

Always follow this format for test cases:

- Start with "should"
- Clearly state the expected behavior
- Mention any important conditions

## Types of Tests

### Unit Tests

Unit tests focus on testing individual components in isolation:

- **Services**: Test business logic and data manipulation
- **Controllers**: Test request handling and response formatting
- **Middleware**: Test behavior under different conditions
- **Utilities**: Test helper functions and modules

Example unit test:

```typescript
describe('UserService', () => {
  it('should return user details when user exists', async () => {
    // Arrange
    const userId = '123';
    const mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: userId, name: 'Test User' }),
    };
    const userService = new UserService(mockUserRepository);

    // Act
    const result = await userService.getUserById(userId);

    // Assert
    expect(result).toEqual({ id: userId, name: 'Test User' });
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });
});
```

### Integration Tests

Integration tests verify that different components work together correctly:

- **API routes**: Test the complete request/response cycle
- **Middleware chains**: Test multiple middleware working together
- **Service compositions**: Test services that depend on other services

Example integration test:

```typescript
describe('User API', () => {
  it('should create a user and return 201 status', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/users')
      .send({ name: 'New User', email: 'user@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('New User');
  });
});
```

## Testing Tools and Libraries

- **Jest**: Used for test runner, assertions, and mocking
- **Supertest**: Used for testing HTTP endpoints
- **TypeDI**: Integrated with our testing to support dependency injection

## Best Practices

### Mocking

- **Explicit Mock Returns**: Always explicitly define what mocked functions should return
- **Minimal Mocking**: Mock only what is necessary for the current test
- **Verify Interactions**: When important, verify that mocked functions were called with expected arguments

### Assertions

- **Be Specific**: Test for specific outcomes, not just that something changed
- **Single Assertion Purpose**: Each test should verify a single behavior
- **Avoid Testing Implementation Details**: Focus on inputs and outputs, not how it works internally

### Testing Asynchronous Code

- Use `async/await` for asynchronous tests
- Handle promises appropriately to avoid false positives
- Ensure all asynchronous operations complete before the test finishes

Example:

```typescript
it('should fetch data asynchronously', async () => {
  const result = await service.fetchData();
  expect(result).toBeDefined();
});
```

### Error Handling

- Test both successful and error scenarios
- Verify that appropriate error messages are returned
- Check that errors are properly logged or handled

Example:

```typescript
it('should throw NotFoundError when user does not exist', async () => {
  const userId = 'nonexistent';
  mockUserRepository.findById.mockResolvedValue(null);

  await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
});
```

## Continuous Integration

Tests are run automatically as part of our CI/CD pipeline:

1. All tests must pass before a pull request can be merged
2. Coverage reports are generated for each build
3. Test performance is monitored to prevent slow tests from affecting development velocity

## Troubleshooting Tests

Common issues and solutions:

- **Flaky Tests**: If a test passes inconsistently, check for race conditions, timeouts, or external dependencies.
- **Memory Leaks**: Ensure resources are properly cleaned up after tests.
- **Test Isolation**: Make sure tests don't depend on the state from other tests.

## Example Test Suite

Here's a complete example of a well-structured test suite:

```typescript
// Mock dependencies before imports
jest.mock('@src/services/logger/logger.service', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Imports
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { NotFoundError } from '@src/errors/not-found.error';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup test dependencies
    mockUserRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Create service instance
    userService = new UserService(mockUserRepository);
  });

  describe('getUserById', () => {
    it('should return user when user exists', async () => {
      // Arrange
      const userId = '123';
      const user = { id: userId, name: 'Test User' };
      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  // Additional test groups for other methods...
});
```

By following these guidelines, we maintain a high-quality, reliable test suite that gives us confidence in our codebase and facilitates continued development.

## Database Testing

### Database Connection Pooling

Our current implementation uses a singleton pattern for the PostgreSQL connection pool. Here's how it works:

1. The `getPool()` function in `pg.db.ts` returns a singleton pool instance
2. If no pool exists or if the existing pool has `pool.ended = true`, a new pool is created
3. Only one active pool should exist at a time, with any previous pool closing via `end()`

This approach prevents multiple open pool connections during test execution while allowing tests to create fresh connections when needed.

```typescript
// Example of our singleton pool implementation
export const getPool = (): Pool => {
  if (!poolInstance || poolInstance.ended) {
    poolInstance = createPool();
  }
  return poolInstance;
};
```

#### Current Limitations

While this approach resolves many testing issues, it's not ideal:

- We currently don't have a context in Jest that runs once before all test suites start and once after all test suites finish
- The globals setup and teardown files run outside the test execution context, so they can't access the same singleton pool
- Each test suite that requires a database connection may create its own pool instance

Future improvements will focus on creating a single pool for all tests and properly draining it after all tests complete. For now, the singleton with `ended` property checking provides a working solution.

### Testing Database Interactions

When testing database interactions, you should:

1. Use the integration test suite for actual database operations
2. Mock the database in unit tests to avoid external dependencies
3. Reset the database state between tests when necessary

Example of a database integration test:

```typescript
describe('PostgreSQL Database Integration Tests', () => {
  const exampleData = { name: 'Test Record' };

  beforeEach(async () => {
    // Set up test tables or data
    const pool = getPool();
    await pool.query('TRUNCATE example_table');
  });

  it('should insert a new record', async () => {
    // Get the pool using our singleton getter
    const pool = getPool();

    // Perform the test
    const result = await pool.query('INSERT INTO example_table(name) VALUES($1) RETURNING *', [
      exampleData.name,
    ]);

    expect(result.rows[0].name).toBe(exampleData.name);
  });
});
```

## Jest Setup and Configuration

### Setup Files

Jest provides several hooks for test setup and configuration:

1. **setupFiles**: Run before the test framework is installed
2. **setupFilesAfterEnv**: Run after the test framework is installed but before tests are run
3. **globalSetup/globalTeardown**: Run once before/after all test suites (but in a different context)

Our project uses a setup file (`jest.setup.ts`) that runs before tests to configure the environment:

```typescript
// jest.setup.ts
import { mockLogger } from './src/__tests__/mocks/logger.mock';

/**
 * Jest setup file to configure global test environment
 */
jest.mock('@src/services/logger/logger.service', () => mockLogger());
```

This file is configured in `jest.config.ts`:

```typescript
const config: Config.InitialOptions = {
  // ...other configurations
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
```

### Conditional Mocking

Our setup allows conditional mocking based on the test file being run. This is useful for:

1. Preventing circular dependencies in mocks
2. Allowing real implementations in specific test files
3. Customizing mock behavior based on the test context

Examples of conditional mocking:

```typescript
// Basic conditional mock based on test file path
const mockLogger = () => {
  const testPath = expect.getState().testPath || '';
  if (testPath.includes('logger.service.test.ts')) {
    // Don't mock the logger in its own tests
    return jest.requireActual('@src/services/logger.service');
  }

  // Use a mock implementation for all other tests
  return {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      // ...other methods
    },
  };
};

// Mock with different behavior based on test file
const mockDatabase = () => {
  const testPath = expect.getState().testPath || '';

  // Default mock implementation
  const defaultMock = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  };

  if (testPath.includes('user.service.test.ts')) {
    // Custom mock for user service tests
    defaultMock.query = jest.fn().mockImplementation(sql => {
      if (sql.includes('SELECT * FROM users')) {
        return Promise.resolve({ rows: [{ id: 1, name: 'Test User' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  }

  return defaultMock;
};

// Mock that only affects certain method calls
const mockAuthService = () => {
  const actual = jest.requireActual('@src/services/auth.service');

  return {
    ...actual,
    // Only mock the verify method
    verify: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
  };
};
```

### Jest Lifecycle and Execution Order

Understanding Jest's execution order helps write better tests:

1. **Load Configuration**: Jest loads `jest.config.ts`
2. **Setup Files**: Executes `setupFiles` before the test framework is installed
3. **Global Setup**: Runs any configured `globalSetup` functions (in a separate context)
4. **Setup After Env**: Executes `setupFilesAfterEnv` after the framework is installed
5. **Describe Blocks**: Executes all describe and test function definitions (not the tests yet)
6. **beforeAll Hooks**: Executes `beforeAll` for each describe block (from outer to inner)
7. **beforeEach Hooks**: Executes `beforeEach` for the current test (from outer to inner)
8. **Test Execution**: Runs the current test
9. **afterEach Hooks**: Executes `afterEach` for the current test (from inner to outer)
10. **Next Test**: Repeats steps 7-9 for each test
11. **afterAll Hooks**: Executes `afterAll` for each describe block (from inner to outer)
12. **Global Teardown**: Runs any configured `globalTeardown` functions (in a separate context)

This sequence repeats for each test file that Jest executes.

## Future Improvements

The current database pool management system will be improved in future updates:

1. Implement a true singleton pool that's shared across all test files
2. Create a more efficient setup that creates one pool at the start of all tests
3. Properly drain the pool after all tests have completed
4. Use Jest's global setup/teardown with inter-process communication to manage the pool

Until these improvements are implemented, tests should follow the current pattern of using `getPool()` and checking the `ended` property to manage database connections.
