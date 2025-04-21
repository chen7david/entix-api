# Express API with routing-controllers, TypeDI, and Zod

This guide documents the architecture and setup for an Express API using [routing-controllers](https://github.com/typestack/routing-controllers), [TypeDI](https://github.com/typestack/typedi), and [Zod](https://zod.dev/) for validation. The codebase is organized for modularity, testability, and maintainability, using path aliases and a shared IoC utility for dependency injection.

## Folder Structure

```
src/
  config/
    env.schema.ts         # Zod schema for environment variables
  domains/
    users/
      users.controller.ts # Example controller
  shared/
    config/
      (empty or for future config modules)
    services/
      app.service.ts      # Configures Express and routing-controllers
      config.service.ts   # Loads and validates env, exposes config
      server.service.ts   # Manages server lifecycle
    utils/
      ioc.util.ts         # Exports Injectable, Inject, and all TypeDI decorators
server.ts                 # Entry point
```

## Key Principles

- **Dependency Injection**: All services use TypeDI via a shared `@Injectable` decorator from `@shared/utils/ioc.util`.
- **Path Aliases**: All imports use aliases (e.g. `@shared/services/...`, `@src/config/...`) for clarity and maintainability.
- **Validation**: Environment variables are validated with Zod, not class-validator.
- **Graceful Shutdown**: `ServerService` supports async cleanup hooks for safe shutdown.
- **DRY & Modular**: Each service has a single responsibility and is easily testable.

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

```ts
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import express from 'express';
import { Injectable } from '@shared/utils/ioc.util';

@Injectable()
export class AppService {
  // ... see codebase for full implementation
}
```

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

## Further Reading

- [routing-controllers docs](https://github.com/typestack/routing-controllers)
- [TypeDI docs](https://github.com/typestack/typedi)
- [Zod docs](https://zod.dev/)
- [Node.js graceful shutdown](https://nodejs.org/en/docs/guides/graceful-shutdown/)

---

This setup is designed for clarity, maintainability, and extensibility. For questions or improvements, see the code comments and referenced documentation.
