---
title: Testing
---

# Testing

This document outlines the testing strategy and practices for the Entix API.

## Testing Framework

Entix API uses Jest as its testing framework. Tests are organized alongside the code they test, following a `.test.ts` naming convention.

## Test Structure

Tests are structured according to the AAA pattern: Arrange, Act, Assert.

```typescript
import { UsersController } from './users.controller';
import { UserService } from './user.service';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UserService;

  beforeEach(() => {
    // Arrange - set up test dependencies
    userService = {
      findAll: jest.fn().mockResolvedValue([{ id: '1', username: 'testuser' }]),
      findById: jest.fn(),
    } as unknown as UserService;

    controller = new UsersController(userService);
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      // Act - call the method under test
      const result = await controller.getUsers();

      // Assert - verify the expected outcome
      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual({ users: [{ id: '1', username: 'testuser' }] });
    });
  });
});
```

## Test Types

### Unit Tests

Unit tests focus on testing individual components in isolation. Dependencies are typically mocked or stubbed.

```typescript
// Example unit test for a service
describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as UserRepository;

    service = new UserService(repository);
  });

  describe('findAll', () => {
    it('should return all users from repository', async () => {
      const users = [{ id: '1', username: 'user1' }];
      repository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
});
```

### Integration Tests

Integration tests verify that different components work together correctly. These tests may involve actual database connections or HTTP requests.

```typescript
// Example integration test using supertest
import { app } from '../app';
import request from 'supertest';

describe('Users API', () => {
  describe('GET /users', () => {
    it('should return 200 and list of users', async () => {
      const response = await request(app).get('/users').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });
});
```

## Database Testing

For tests that involve database operations, Entix API provides utilities to set up and tear down test databases.

```typescript
import { setupTestDatabase, teardownTestDatabase } from '../utils/db-test.util';

describe('UserRepository', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // Test cases...
});
```

## Mocking

Use Jest's mocking capabilities to isolate the code under test:

```typescript
// Mocking a module
jest.mock('../../config/db.config', () => ({
  query: jest.fn(),
}));

// Mocking a class method
const mockMethod = jest.spyOn(service, 'methodName').mockResolvedValue(expectedResult);
```

## Test Coverage

Aim for high test coverage, but focus on the quality of tests rather than just the coverage percentage. All critical paths should be covered by tests.

Run test coverage reports with:

```bash
npm run test:coverage
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from previous tests.

2. **Descriptive Names**: Test names should clearly describe what's being tested and the expected outcome.

3. **Test Organization**: Group related tests using `describe` blocks.

4. **Focus on Behavior**: Test the behavior of components, not their implementation details.

5. **Avoid Test Duplication**: Don't write multiple tests that verify the same behavior.

6. **Test Edge Cases**: Include tests for error conditions, edge cases, and boundary values.

7. **Clean Test Data**: Clean up any test data or state after tests complete.

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode (during development):

```bash
npm run test:watch
```

Run a specific test file:

```bash
npm test -- path/to/file.test.ts
```
