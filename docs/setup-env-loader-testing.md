# Testing the ConfigService

This guide explains how to write robust, maintainable tests for the `ConfigService` class and similar configuration or service classes in your project.

## Types of Tests

- **Unit Tests:** Test a single unit (e.g., a class or function) in isolation. Use mocks/stubs for dependencies (like `dotenv` or `fs`).
- **Integration Tests:** Test how multiple units work together. For config services, this might mean loading real `.env` files (not recommended for CI).
- **End-to-End (E2E) Tests:** Test the entire application stack. Not typically needed for config services.

## When and Why to Mock

- **When:**
  - When you want to isolate the logic of your class from external dependencies (e.g., file system, environment, third-party libraries).
  - When you want to simulate different scenarios (e.g., missing files, invalid env values) without changing your real environment.
- **Why:**
  - To ensure tests are deterministic and fast.
  - To avoid side effects (e.g., modifying real env vars or files).

## How to Mock

- Use Jest's `jest.mock()` to mock modules like `dotenv` and `fs`.
- Use `jest.spyOn()` or direct assignment to control/mock function return values.

**Example:**

```ts
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn() }));

const mockDotenv = require('dotenv');
const mockFs = require('fs');

(mockFs.existsSync as jest.Mock).mockReturnValue(true);
```

## Example Test Cases

- Loads and validates environment variables successfully
- Does not throw if `.env` file is missing
- Throws a formatted error if validation fails
- Throws a formatted error if a required env var is missing

## Test Coverage

- Use Jest's coverage tools: `npm run test -- --coverage`
- Aim for high coverage, but prioritize meaningful tests over 100% coverage.
- Cover all branches: success, missing file, validation error, missing key, etc.

## Best Practices

- Keep tests isolated and stateless (reset mocks and env vars between tests).
- Use clear, descriptive test names.
- Mock only what you need—avoid over-mocking.
- Place test files next to the code they test or in a `__tests__` folder.
- Document any non-obvious test logic.

## References

- [Jest Documentation](https://jestjs.io/docs/mock-functions)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
