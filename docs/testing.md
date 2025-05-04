# Testing Guide

This guide covers best practices for testing within the Entix API project, with a focus on dependency injection using TypeDI and our test file conventions.

## Testing Philosophy

Our tests follow these core principles:

1. **Isolation**: Tests should be isolated and not depend on the execution of other tests.
2. **Repeatability**: Tests should produce the same results when run multiple times.
3. **Speed**: Tests should run quickly to encourage frequent testing.
4. **Clarity**: Tests should clearly indicate what they're testing and what went wrong when they fail.

## Test Types and Naming Conventions

- **Unit Tests (`.spec.ts`)**
  - Test a single function, class, or module in isolation (with dependencies mocked or stubbed).
  - Suffix: `.spec.ts`
  - **Example:** `user.service.spec.ts`, `user.controller.spec.ts`, `user.repository.spec.ts`
- **Integration Tests (`.test.ts`)**
  - Test how multiple modules or layers work together (e.g., controller + service + database, or actual HTTP endpoints).
  - Suffix: `.test.ts`
  - **Naming convention:**
    - For controller-level integration tests (e.g., HTTP endpoint tests), use: `user.controller.test.ts`, `auth.controller.test.ts`, etc.
    - For broader feature or API integration, use: `user.integration.test.ts`, `auth.integration.test.ts`, etc.
    - The general pattern is: `type.serviceType.testType.ts` where:
      - `type` = domain/feature (e.g., `user`, `auth`)
      - `serviceType` = main class/layer under test (e.g., `controller`, `service`)
      - `testType` = `spec` for unit, `test` for integration
  - **Examples:**
    - `user.controller.test.ts` (integration test for user controller endpoints)
    - `user.integration.test.ts` (integration test for the user feature as a whole)
    - `auth.controller.test.ts` (integration test for auth controller endpoints)
- **End-to-End (E2E) Tests (`.e2e.ts`)**
  - Test the entire application workflow, often involving real HTTP requests, databases, and possibly other services.
  - Suffix: `.e2e.ts` (not required at this stage; may live outside this repo)

### Jest Configuration

- Both `.spec.ts` and `.test.ts` files are included in the test run. Update `jest.config.js` if needed:
  ```js
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  ```

### Jest Global Setup: Ensuring Test Database Schema

To ensure the test database schema is always up-to-date, Jest is configured to automatically run the following command before any tests are executed:

```bash
npm run db:push-test
```

This is achieved using a Jest setup file located at `tests/config/jest.setup.ts`, which is registered via the `setupFilesAfterEnv` property in `jest.config.ts`:

```ts
setupFilesAfterEnv: ['<rootDir>/tests/config/jest.setup.ts'],
```

The setup file runs the database push command using Node's `child_process` API. If the command fails, tests will not run, ensuring you never test against an outdated schema.

**You do not need to run this manually**—it is handled automatically every time you run `npm test` or `npm run test:watch`.

> **Best Practice:** Always keep your test database schema in sync with your migrations. This setup enforces that best practice automatically.

## Using TypeDI Container in Tests

### Why Use the DI Container for Testing?

Using TypeDI for dependency injection in tests offers several advantages over traditional mocking:

1. **Real-world usage**: Tests reflect how services are actually instantiated and used in production.
2. **Fewer mocks**: You can register mock implementations directly in the container, reducing the need for `jest.mock()` calls.
3. **Better encapsulation**: The DI container handles dependency resolution, so your tests don't need to know the internal structure of services.
4. **Simpler refactoring**: When service dependencies change, often only the container configuration needs updating, not all test files.
5. **Cleaner test code**: Container-based tests are typically more readable and maintainable.

### Key Differences from Traditional Mocking

Traditional approach with `jest.mock()`:

```typescript
// Mock dependencies at the module level
jest.mock('@domains/user/user.repository');
jest.mock('@shared/services/logger/logger.service');

// In your test:
const userRepository = new UserRepository() as jest.Mocked<UserRepository>;
userRepository.findById.mockResolvedValue({ id: 1, name: 'Test' });

const service = new UserService(loggerService, userRepository);
```

Container-based approach:

```typescript
// In your test:
Container.reset();

const mockRepo = { findById: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }) };
Container.set(UserRepository, mockRepo);

// Get the service directly from the container
const service = Container.get(UserService);
```

### Best Practices

1. **Always reset the container**: Call `Container.reset()` in `beforeEach` to ensure a clean state.
2. **Mock only what's necessary**: External dependencies (like databases or HTTP clients) should still be mocked.
3. **Register mock implementations**: Use `Container.set()` to register your mock implementations.
4. **Get your service from the container**: Instead of using `new Service()`, get the service from the container.
5. **Clean up after tests**: Use `afterEach` or `afterAll` for cleanup if needed.

## Example: Testing with TypeDI

```typescript
import 'reflect-metadata';
import { Container } from 'typedi';
import { UserService } from '@domains/user/user.service';
import { UserRepository } from '@domains/user/user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<UserRepository>;

  beforeEach(() => {
    // Reset container
    Container.reset();

    // Create mock repository
    mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
      // ... other methods
    };

    // Register with container
    Container.set(UserRepository, mockUserRepository);

    // Get service from container
    userService = Container.get(UserService);
  });

  it('should find a user by id', async () => {
    const user = await userService.findById(1);
    expect(user).toEqual({ id: 1, name: 'Test User' });
    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
  });
});
```

## When to Still Use jest.mock()

While the container-based approach is preferred, there are cases where `jest.mock()` is still appropriate:

1. **External libraries**: For dependencies that aren't part of the DI container, like `fs`, `axios`, etc.
2. **Global utilities**: For stateless utilities that are imported directly rather than injected.
3. **Complex mocking needs**: When you need to mock specific behaviors that can't be easily achieved with simple objects.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/file.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Continuous Integration and Testing

Our CI pipeline runs all tests automatically on pull requests and merges to main branches. Tests must pass before code can be merged. See `docs/ci-cd.md` for full CI/CD details.

## Linting and Preventing Accidental .only/.skip in Tests

To ensure the full test suite always runs in CI and production, we use [eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest) to prevent accidental commits of focused or skipped tests (e.g., `describe.only`, `test.only`, `it.only`, `describe.skip`, etc.).

- **You are free to use `.only` or `.skip` during local development** to focus or skip tests as needed.
- **However, these will be flagged as errors during linting** (e.g., when running `npm run lint` or as part of a pre-commit hook with Husky).
- **Commits with `.only` or `.skip` in tests will be blocked** if you have Husky set up to run linting on pre-commit.

This ensures that no focused or skipped tests are ever merged to main branches, following industry best practices for test reliability.

**Example error:**

```
error  Unexpected focused test.  jest/no-focused-tests
```

See `.eslintrc.cjs` for configuration details.

## Pre-commit Linting with Husky

This project uses [Husky](https://typicode.github.io/husky/) to enforce code formatting and linting before every commit. This ensures that code (including tests) is always formatted with Prettier and adheres to all linting rules, including the prevention of accidental `.only`/`.skip` in tests.

### How it works

On every `git commit`, Husky runs `npm run format:precommit` (Prettier) and then `npm run lint` via a pre-commit hook.

If any formatting or lint errors are found (including `.only`/`.skip` in tests), the commit is **blocked** and you will see the error messages in your terminal.

This helps ensure that only well-formatted, high-quality, production-ready code is committed and pushed.

### Why is `"prepare": "husky install"` in package.json?

> **Note:**
> The `"prepare": "husky install"` script in your `package.json` ensures that Husky sets up Git hooks automatically every time someone installs dependencies (e.g., via `npm install` or `yarn install`). This is necessary because Git hooks are not stored in your repository's `.git` directory (which is not versioned). Without this, contributors who freshly clone the repo or install dependencies would not have the pre-commit hooks set up, and code quality checks could be bypassed. By following this industry best practice, you ensure that all contributors always have the correct hooks installed, maintaining consistent code quality across the team. See the [Husky documentation](https://typicode.github.io/husky/#/?id=automatic-recommended) for more details.

### Common pitfalls and workarounds

- **Skipping hooks:** If you need to bypass the hook (not recommended), you can use `git commit -n` or set `HUSKY=0` for the command (see [Husky docs](https://typicode.github.io/husky/how-to.html#skipping-git-hooks)).
- **CI environments:** Husky is automatically disabled in CI by setting `HUSKY=0` in your CI config.
- **Node version managers:** If you use a Node version manager (like `nvm`), see the Husky docs for [PATH issues](https://typicode.github.io/husky/how-to.html#node-version-managers-and-guis).

### Why do we do this?

This is an industry best practice to prevent accidental commits of code that would break the build, skip tests, or otherwise reduce code quality.

See `.husky/pre-commit` and `.eslintrc.cjs` for configuration details.
