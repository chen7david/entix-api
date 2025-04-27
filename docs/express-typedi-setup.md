# Express API with routing-controllers, TypeDI, and Zod

This guide documents the architecture and setup for an Express API using [routing-controllers](https://github.com/typestack/routing-controllers), [TypeDI](https://github.com/typestack/typedi), and [Zod](https://zod.dev/) for validation. The codebase is organized for modularity, testability, and maintainability, using path aliases and a shared IoC utility for dependency injection.

## Folder Structure

```
src/
  config/
    env.schema.ts         # Zod schema for environment variables
  domains/
    openapi/
      openapi.controller.ts # Serves OpenAPI spec
      openapi.schema.ts     # Aggregates Zod schema registration
      openapi.service.ts    # Generates OpenAPI spec
    health/
      health.controller.ts  # Handles /health endpoint
    users/
      users.controller.ts # Example domain controller
      user.dto.ts           # User-related DTOs and schema registration
  shared/
    middleware/
      app-error.middleware.ts # Handles global errors
      not-found.middleware.ts # Handles 404 errors
    services/
      app.service.ts      # Configures Express and routing-controllers
      config.service.ts   # Loads and validates env, exposes config
      server.service.ts   # Manages server lifecycle
      logger.service.ts   # Manages logging
    utils/
      ioc.util.ts         # Exports Injectable, Inject, and all TypeDI decorators
server.ts                 # Entry point
```

## Key Principles

- **Dependency Injection**: All services use TypeDI via a shared `@Injectable` decorator from `@shared/utils/ioc.util`.
- **Path Aliases**: All imports use aliases (e.g. `@shared/services/...`, `@src/config/...`) for clarity and maintainability.
- **Validation**: Environment variables are validated with Zod, not class-validator.
- **Logging**: All logging is performed via a singleton `LoggerService` using [Pino](https://getpino.io/), with pretty-printing in development and structured JSON in production. Log levels are type-safe and DRY via a shared enum.
- **Graceful Shutdown**: `ServerService` supports async cleanup hooks for safe shutdown, and passes the logger to all cleanup functions for structured logging during shutdown.
- **DRY & Modular**: Each service has a single responsibility and is easily testable.

## Logger Service

### Rationale

Logging is handled by a dedicated `LoggerService` that wraps [Pino](https://getpino.io/), providing:

- Consistent, high-performance logging across all environments
- Pretty logs in development, structured JSON in production
- Type-safe log levels via a shared enum (`LogLevel`)
- Dependency-injected logger for testability and modularity
- A `cleanup()` method for future extensibility (e.g., log flushing, New Relic integration)

### Usage Example

#### 1. Logger Service (`@shared/services/logger.service.ts`)

```ts
import { Injectable } from '@shared/utils/ioc.util';
import pino, { Logger as PinoLogger, Level } from 'pino';
import { LogLevel } from '@shared/constants/logger.constants';
import { ConfigService } from '@shared/services/config.service';

@Injectable()
export class LoggerService {
  // ... see codebase for full implementation
}
```

#### 2. Injecting Logger in Services

```ts
import { LoggerService } from '@shared/services/logger.service';

@Injectable()
export class SomeService {
  constructor(private readonly loggerService: LoggerService) {}

  doSomething() {
    this.loggerService.log({ level: LogLevel.INFO, msg: 'Doing something' });
  }
}
```

#### 3. Cleanup Pattern in ServerService

```ts
import { LoggerService } from '@shared/services/logger.service';
import type pino from 'pino';

@Injectable()
export class ServerService {
  private cleanupTasks: ((logger: pino.Logger) => Promise<void>)[] = [];
  constructor(/* ... */) {
    /* ... */
  }

  cleanup(fn: (logger: pino.Logger) => Promise<void>): void {
    this.cleanupTasks.push(fn);
  }

  async start(): Promise<void> {
    const logger = this.loggerService.getLogger();
    // ...
    const shutdown = async () => {
      await Promise.all(this.cleanupTasks.map((fn) => fn(logger)));
      logger.info('Cleanup complete. Exiting.');
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
```

#### 4. Registering a Cleanup Task

```ts
serverService.cleanup(async (logger) => {
  // ... perform cleanup
  logger.info('Service cleaned up');
});
```

### Logging Best Practices

- Use the `LoggerService` for all logs; do not use `console.log`.
- Use the `LogLevel` enum for type-safe log levels.
- Add context to logs using Pino's child loggers or metadata objects.
- Never log sensitive data.
- Use the logger in cleanup functions for visibility during shutdown.
- In tests, mock or stub the logger to avoid noisy output.

### Example: Entry Point (`src/server.ts`)

```ts
import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server.service';
import { AppService } from '@shared/services/app.service';
import { ConfigService } from '@shared/services/config.service';
import { LoggerService } from '@shared/services/logger.service';

async function main() {
  const configService = Container.get(ConfigService);
  const loggerService = Container.get(LoggerService);
  const appService = new AppService();
  const serverService = new ServerService({
    appService,
    configService,
    loggerService,
  });
  await serverService.start();
}
main().catch((err) => {
  // Use a fallback logger if DI fails
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

## Application Bootstrap (`AppService`)

The `AppService` is responsible for setting up the core Express application:

```ts
// src/shared/services/app/app.service.ts
import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { NotFoundMiddleware } from '@shared/middleware/not-found.middleware';
import { useContainer, useExpressServer } from 'routing-controllers';
import express, { Express } from 'express';
import { Container } from 'typedi';
import path from 'path';
import { Injectable } from '@shared/utils/ioc.util';

@Injectable()
export class AppService {
  private app: Express;

  constructor(_deps?: Record<string, unknown>) {
    useContainer(Container);
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configure routing-controllers with all controllers and middlewares
    useExpressServer(this.app, {
      controllers: [path.join(__dirname, '../../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware, NotFoundMiddleware],
      defaultErrorHandler: false,
    });
  }

  getApp(): Express {
    return this.app;
  }
}
```

- It initializes Express and common middleware (`json`, `urlencoded`).
- It uses `routing-controllers` to:
  - Register all controllers found in `src/domains/**/*.controller.ts`.
  - Register global middleware (`ErrorHandlerMiddleware`, `NotFoundMiddleware`).
- The `/health` endpoint is now managed by `HealthController` and `/api/openapi.json` by `OpenapiController`.

## Usage Example

### 1. Environment Schema (`src/config/env.schema.ts`)

```ts
import { z } from 'zod';
export const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
});
export type Env = z.infer<typeof envSchema>;
```

### 2. Config Service (`@shared/services/config.service.ts`)

```ts
import { envSchema, Env } from '@src/config/env.schema';
import dotenv from 'dotenv';
import { Injectable } from '@shared/utils/ioc.util';

@Injectable()
export class ConfigService {
  // ... see codebase for full implementation
}
```

### 3. App Service (`@shared/services/app.service.ts`)

_See the **Application Bootstrap** section above for the updated `AppService` implementation._

### 4. Server Service (`@shared/services/server.service.ts`)

```ts
import { AppService } from '@shared/services/app.service';
import { ConfigService } from '@shared/services/config.service';
import { Injectable, Inject } from '@shared/utils/ioc.util';
import http from 'http';

@Injectable()
export class ServerService {
  // ... see codebase for full implementation
}
```

### 5. Controller Example (`src/domains/users/users.controller.ts`)

```ts
import { JsonController, Get } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';

@Injectable()
@JsonController('/users')
export class UsersController {
  @Get('/')
  getAll() {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }
}
```

### 6. Entry Point (`src/server.ts`)

```ts
import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server.service';
import { ConfigService } from '@shared/services/config.service';
import { AppService } from '@shared/services/app.service';

async function main() {
  void ConfigService;
  void AppService;
  const serverService = Container.get(ServerService);
  await serverService.start();
}
main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

## Graceful Shutdown

Register async cleanup hooks with `serverService.cleanup(async () => { ... })`.

## Vulnerabilities & Considerations

- **Environment Validation**: If env is invalid, the server will throw on first config access.
- **No request validation**: Add Zod validation in controllers for request bodies as needed.
- **Dependency Injection**: All DI must use the shared IoC utility to avoid multiple container instances.

## Global Error Handling

The API uses a centralized global error handler for all routes and controllers, ensuring consistent error responses and robust logging. This is implemented using a custom `GlobalErrorMiddleware` registered with `routing-controllers`.

### Error Class Hierarchy

All custom errors extend the base `AppError` class, which provides a standard structure for error responses:

- `AppError` (base)
- `NotFoundError`
- `UnauthorizedError`
- `ForbiddenError`
- `BadRequestError`
- `ValidationError` (used for Zod validation failures)
- `InternalServerError`

All error classes accept a message and optional details. Throw these errors in your controllers or services to return a structured error response to the client.

#### Example Usage

```ts
import { NotFoundError } from '@shared/services/app/http-errors';

@Get('/user/:id')
getUser(@Param('id') id: string) {
  const user = findUser(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}
```

### Zod Validation Errors

If a Zod schema validation fails, the error is automatically caught and formatted as a `ValidationError`, returning a 422 status and a clean, user-friendly error structure.

### Unknown Errors

If an unknown error occurs, the middleware logs the error with a unique reference ID using the `LoggerService` and returns a generic 500 Internal Server Error to the client, including the reference ID for support/debugging.

### Example Error Response

```json
{
  "error": "NotFoundError",
  "message": "User not found"
}
```

For validation errors:

```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": [{ "path": "email", "message": "Invalid email address", "code": "invalid_string" }]
}
```

For unknown errors:

```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred.",
  "referenceId": "b1c2d3e4-..."
}
```

### Best Practices

- Always throw `AppError` or its subclasses for predictable errors.
- Use Zod for validation and let the middleware handle formatting.
- Never leak sensitive information in error messages.
- Use the reference ID from 500 errors for debugging and support.

## Further Reading

- [routing-controllers docs](https://github.com/typestack/routing-controllers)
- [TypeDI docs](https://github.com/typestack/typedi)
- [Zod docs](https://zod.dev/)
- [Node.js graceful shutdown](https://nodejs.org/en/docs/guides/graceful-shutdown/)

---

This setup is designed for clarity, maintainability, and extensibility. For questions or improvements, see the code comments and referenced documentation.
