# Logging System Documentation

## Overview

The logging system in this application is modular, robust, and built around Pino. It provides structured, context-aware logging, error handling, and optional New Relic integration. The logger is split into focused modules:

- `LoggerService`: Core logging (info, error, etc.) and context/child loggers
- `HttpLoggerService`: HTTP request/response logging middleware
- `LoggerFactory`: Centralized creation/configuration of loggers

## Features

- Structured JSON logging
- Contextual and child loggers
- AppError integration
- Operation tracking helpers
- HTTP request logging middleware
- Pretty printing in development
- New Relic integration (optional)
- Test-friendly (mock logger)

## Usage

### 1. Getting a Logger

**Via Dependency Injection:**

```typescript
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { LoggerService } from '@src/services/logger/logger.service';

@Injectable()
export class UserService {
  constructor(private logger: LoggerService) {
    this.logger = logger.forComponent('UserService');
  }

  async createUser(userData: any) {
    this.logger.info('Creating new user', { email: userData.email });
    // ...
  }
}
```

**Direct Access (e.g., in setup code):**

```typescript
import { getLogger } from '@src/services/logger/logger.module';
const logger = getLogger();
logger.info('App started');
```

### 2. HTTP Request Logging

Add the HTTP logger middleware to your Express app:

```typescript
import { getHttpLogger } from '@src/services/logger/logger.module';

app.use(getHttpLogger().getMiddleware());
```

### 3. Adding Context and Child Loggers

```typescript
const requestLogger = logger.createContext({ requestId: 'abc', userId: '123' });
requestLogger.info('Processing request');

const componentLogger = logger.forComponent('UserService', { feature: 'auth' });
componentLogger.info('User login');
```

### 4. Logging Errors

```typescript
try {
  // ...
} catch (error) {
  logger.error(error, 'Operation failed', { userId: '123' });
}
```

### 5. Operation Tracking

```typescript
logger.logStart('import');
// ...
logger.logSuccess('import', 1200);
// or on error
logger.logFailure('import', new Error('fail'));
```

### 6. Configuration

All logger configuration is managed via environment variables and validated at startup. See `.env` and `src/config/schema.config.ts` for details.

### 7. Testing

When `NODE_ENV=test` and `LOG_IN_TESTS` is not set, a mock logger is used. You can assert on logs in your tests:

```typescript
import { getLogger } from '@src/services/logger/logger.module';
const mockLogger = getLogger();
mockLogger.clearLogs();
// ... run code
expect(mockLogger.getLogsByLevel('error')).toHaveLength(1);
```

## Best Practices

- Always use structured context (not string interpolation)
- Use `forComponent` in services/controllers
- Use child loggers for per-request context
- Never log sensitive data
- Use operation tracking helpers for long-running tasks

## Advanced: Custom Logger Creation

If you need a custom logger (e.g., for a library), use the factory:

```typescript
import { LoggerFactory } from '@src/services/logger/logger.factory';
const factory = new LoggerFactory();
const customLogger = factory.createLogger({ name: 'custom', level: 'debug' });
```

## Configuration

The logger is configured through environment variables:

| Variable            | Description                         | Default                        |
| ------------------- | ----------------------------------- | ------------------------------ |
| `NODE_ENV`          | Environment (`dev`, `test`, `prod`) | -                              |
| `LOG_LEVEL`         | Minimum log level to output         | `info` in prod, `debug` in dev |
| `LOG_IN_TESTS`      | Whether to enable logging in tests  | `false`                        |
| `APP_NAME`          | Application name for logs           | `entix-api`                    |
| `NEW_RELIC_ENABLED` | Enable New Relic integration        | `false`                        |

## Testing

When running tests, the logging system automatically switches to a mock logger that captures logs in memory instead of writing to stdout. This allows assertions on logs in tests:

```typescript
import { MockLoggerService } from '@src/services/logger/mock-logger.service';

describe('UserService', () => {
  let userService: UserService;
  let mockLogger: MockLoggerService;

  beforeEach(() => {
    // Get the mock logger
    mockLogger = getLogger() as unknown as MockLoggerService;
    mockLogger.clearLogs();

    userService = new UserService(mockLogger);
  });

  it('should log error when user creation fails', async () => {
    // Arrange
    // ... setup test scenario

    // Act
    await expect(userService.createUser(invalidData)).rejects.toThrow();

    // Assert
    const errorLogs = mockLogger.getLogsByLevel('error');
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].message).toContain('Failed to create user');
  });
});
```

To enable real logging during tests (for debugging), set:

```
LOG_IN_TESTS=true
```

## Best Practices

1. **Use structured logging**: Instead of embedding variables in message strings, include them as context:

   ```typescript
   // Good
   logger.info('User logged in', { userId: '123' });

   // Avoid
   logger.info(`User ${userId} logged in`);
   ```

2. **Create component-specific loggers**: Always use `forComponent()` in services, controllers, and repositories:

   ```typescript
   this.logger = logger.forComponent('AuthController');
   ```

3. **Track request context**: For web applications, create a child logger with request context:

   ```typescript
   // In middleware
   req.logger = logger.createContext({
     requestId: req.id,
     path: req.path,
     userId: req.user?.id,
   });
   ```

4. **Use appropriate log levels**:

   - `trace`/`debug`: Development info, not in production
   - `info`: Normal operations, progress tracking
   - `warn`: Unusual but expected situations
   - `error`: Failures that impact operations
   - `fatal`: Critical failures

5. **Include operation IDs**: For tracking complex workflows:

   ```typescript
   logger.info('Starting payment processing', {
     operationId: uuid(),
     paymentId: '123',
   });
   ```

6. **Log start and end of operations**: Use `logStart`/`logSuccess`/`logFailure` to track operation lifecycles.

7. **Be mindful of sensitive data**: Never log passwords, tokens, or sensitive personal information.

## Troubleshooting

### No logs appear in production

- Check that the `LOG_LEVEL` is set appropriately
- Verify that logs are being captured by your log aggregator

### Logs are too verbose

- Adjust the `LOG_LEVEL` environment variable
- Review code for excessive debug/trace logging

### Memory consumption is high

- Limit large objects in log context
- Use sampling for high-volume log sources

### Tests are failing due to log assertions

- Clear logs between tests with `mockLogger.clearLogs()`
- Verify that the mock logger is being used correctly
