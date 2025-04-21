# Writing Tests for TypeDI-based Services

This guide explains how to write tests for services using TypeDI in this codebase, how to swap implementations in the container, and when to use Jest mocks.

## Swapping Implementations in the TypeDI Container

TypeDI allows you to swap service implementations in the container for testing. This is often preferable to complex mocking because:

- It tests the real DI wiring and lifecycle.
- It allows you to inject lightweight or fake implementations for dependencies.
- It avoids brittle Jest mock setups and makes tests more maintainable.

### Example: Swapping a Service

```ts
import { Container } from 'typedi';
import { AppService } from '@shared/services/app.service';

class MockAppService {
  getApp() {
    return 'mock-app';
  }
}
Container.set(AppService, new MockAppService() as unknown as AppService);
const swapped = Container.get(AppService);
expect(swapped.getApp()).toBe('mock-app');
// Reset after test
test.afterEach(() => Container.remove(AppService));
```

### Example: Swapping Multiple Dependencies

```ts
import { ServerService } from '@shared/services/server.service';
import { AppService } from '@shared/services/app.service';
import { ConfigService } from '@shared/services/config.service';

class MockAppService {
  getApp() {
    return { listen: jest.fn() };
  }
}
class MockConfigService {
  get() {
    return 1234;
  }
}
Container.set(AppService, new MockAppService() as any);
Container.set(ConfigService, new MockConfigService() as any);
const serverService = Container.get(ServerService);
// ... run tests
Container.remove(AppService);
Container.remove(ConfigService);
```

## Why Prefer DI Swapping Over Jest Mocks?

- **Cleaner**: No need to mock every method; just provide a minimal implementation.
- **Realistic**: Tests the actual DI system, not just isolated functions.
- **Flexible**: Easily swap any dependency, including nested ones.

## When to Use Jest Mocks

There are cases where DI swapping is not enough:

- **Third-party modules**: If you need to mock a package that is not injected via TypeDI.
- **Static functions or singletons**: If a dependency is not managed by the container.
- **Global side effects**: For example, mocking `Date.now()` or process environment.

### Example: Jest Mock for Non-DI Dependency

```ts
jest.mock('fs');
import fs from 'fs';
(fs.readFileSync as jest.Mock).mockReturnValue('mocked');
```

## Best Practices

- Always reset the container after each test to avoid cross-test pollution.
- Prefer swapping via `Container.set()` for all DI-managed services.
- Use Jest mocks only for non-DI dependencies or global effects.
- Use TSDoc comments for all test functions for clarity.

## Isolating Tests with Container.reset()

For complete test isolation, especially when your tests modify the DI container (e.g., swapping implementations or changing environment variables), use:

```ts
beforeEach(() => {
  Container.reset();
});
```

**Why use `Container.reset()`?**

- Ensures each test starts with a clean DI container.
- Prevents cross-test pollution from previous mocks or singletons.
- Guarantees that new instances are created and decorators are re-executed.

**When to use:**

- When you want each test to have a truly isolated DI environment.
- When your tests set or remove services in the container.

**When not to use:**

- If you have global singletons or setup that must persist across tests (rare in most service-level tests).

## Further Reading

- [TypeDI Testing Docs](https://github.com/typestack/typedi#testing)
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)
