# Testing the Environment Service

This guide explains how to write robust, maintainable tests for the `EnvService` and similar injectable services in your project.

## Types of Tests

- **Unit Tests:** Test a single unit (e.g., a class or function) in isolation. Use mocks/stubs for dependencies.
- **Integration Tests:** Test how multiple units work together, usually with DI.
- **End-to-End (E2E) Tests:** Test the entire application stack. Not typically needed for config services.

## When and Why to Mock

- **When:**
  - To isolate service logic from external dependencies (file system, environment variables, third-party libraries).
  - To simulate different scenarios (missing files, invalid environment values) without changing your real environment.
- **Why:**
  - To ensure tests are deterministic and fast.
  - To avoid side effects (modifying real env vars or files).

## Testing Injectable Services

There are two approaches to testing injectable services:

### 1. Direct Construction with Mocked Dependencies

```typescript
import { EnvService } from '@src/services/env/env.service';
import { z } from 'zod';

// Mock dependencies
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn() }));

import * as dotenv from 'dotenv';
import * as fs from 'fs';

describe('EnvService - Direct Construction', () => {
  // Test setup and tests...

  it('should load environment variables', () => {
    // Set up mocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    // Create service directly with custom schema
    const envService = new EnvService(testSchema);

    // Assertions
    expect(envService.env.PORT).toBe(3000);
  });
});
```

### 2. Using TypeDI Container for Integration Tests

```typescript
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { EnvService } from '@src/services/env/env.service';

describe('EnvService - Container Injection', () => {
  beforeEach(() => {
    // Reset the container before each test
    Container.reset();
  });

  it('should be injectable in other services', () => {
    // Override with test implementation
    const mockEnvService = { env: { PORT: 3000 } };
    Container.set(EnvService, mockEnvService);

    // Get test service that uses EnvService
    const testService = Container.get(TestService);

    // Test the service with injected mock
    expect(testService.getPort()).toBe(3000);
  });
});
```

## Example Test Cases for EnvService

- **Load and validate environment variables successfully**
- **Do not throw if .env file is missing**
- **Throw a formatted error if validation fails**
- **Throw a formatted error if required env var is missing**
- **Integration with dependent services**

## Best Practices

- **Test in isolation:** Use mocks and stubs for dependencies.
- **Check error formatting:** Validate the error message format for invalid inputs.
- **Reset container between tests:** When using TypeDI, always reset the container in `beforeEach`.
- **Test real scenarios:** Make sure your tests cover actual use cases.
- **Keep tests isolated and deterministic:** Reset environment variables between tests.

## Example Implementation

See the [src/services/env/env.service.test.ts](../src/services/env/env.service.test.ts) file for a complete example of testing the EnvService with mocks.

## References

- [Jest Documentation](https://jestjs.io/docs/mock-functions)
- [TypeDI Testing](https://github.com/typestack/typedi#testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
