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

## Test Best Practices

1. Use meaningful test descriptions
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test edge cases
5. Maintain test isolation
