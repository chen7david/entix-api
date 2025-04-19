# Dependency Injection with TypeDI

This document explains how dependency injection is implemented in EntixAPI using TypeDI, including setup, usage patterns, and testing strategies.

## Overview

EntixAPI uses TypeDI for dependency injection to:

1. **Decouple components** - Reduce direct dependencies between classes
2. **Simplify testing** - Replace real implementations with mocks
3. **Improve maintainability** - Centralize service configuration
4. **Enhance modularity** - Make components more interchangeable

## Basic Setup

TypeDI is already integrated with routing-controllers through the AppService:

```typescript
// src/services/app/app.service.ts
import { useContainer } from 'routing-controllers';
import { Container } from '@src/shared/utils/typedi/typedi.util';

export class AppService {
  constructor(options: AppServiceOptions) {
    /**
     * Use the Container from typedi for routing-controllers
     */
    useContainer(Container);

    // ...rest of constructor
  }
}
```

## Creating Injectable Classes

### Injectable Decorator

All classes that will be used with dependency injection must be decorated with `@Injectable()`:

```typescript
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@Injectable()
export class UserService {
  // Service implementation
}
```

### Class Hierarchy with Dependency Injection

The typical injection hierarchy is:

```
Controllers → Services → Repositories
```

Each layer can also use shared utilities like Logger or Config.

## Examples

### Repository

Repositories handle data access and are typically injected into services:

```typescript
// src/domains/users/users.repository.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { User } from './user.model';

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    // Database access logic
    return { id, name: 'John Doe', email: 'john@example.com' };
  }

  async create(userData: Partial<User>): Promise<User> {
    // Database creation logic
    return { id: '123', ...userData };
  }
}
```

### Service

Services contain business logic and use repositories:

```typescript
// src/domains/users/users.service.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { UserRepository } from './users.repository';
import { User } from './user.model';
import { NotFoundError } from '@src/shared/utils/errors/error.util';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError({
        message: `User with ID ${id} not found`,
      });
    }

    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.userRepository.create(userData);
  }
}
```

### Controller

Controllers handle HTTP requests and use services:

```typescript
// src/domains/users/users.controller.ts
import { JsonController, Get, Param, Post, Body } from 'routing-controllers';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { UserService } from './users.service';
import { User } from './user.model';

@Injectable()
@JsonController('/v1/users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post('/')
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }
}
```

## Injecting Shared Utilities

### Logger

Create a Logger class that can be injected anywhere:

```typescript
// src/shared/utils/logger/logger.util.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@Injectable()
export class Logger {
  private context: string = 'App';

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[${this.context}] ${message}`, meta || '');
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[${this.context}] ${message}`, meta || '');
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${this.context}] ${message}`, meta || '');
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[${this.context}] ${message}`, meta || '');
  }
}
```

Then inject it into your classes:

```typescript
// Using Logger in a service
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {
    this.logger.setContext('UserService');
  }

  async getUserById(id: string): Promise<User> {
    this.logger.info(`Getting user by ID: ${id}`);
    // ...rest of method
  }
}
```

### Config

Create a Config class for application settings:

```typescript
// src/shared/utils/config/config.util.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { EnvService } from '@src/services/env/env.service';

@Injectable()
export class Config {
  constructor(private envService: EnvService) {}

  get<T>(key: keyof typeof this.envService.env): T {
    return this.envService.env[key] as unknown as T;
  }

  get isDevelopment(): boolean {
    return this.get<string>('NODE_ENV') === 'dev';
  }

  get isProduction(): boolean {
    return this.get<string>('NODE_ENV') === 'prod';
  }

  get isTest(): boolean {
    return this.get<string>('NODE_ENV') === 'test';
  }
}
```

Then inject it where needed:

```typescript
// Using Config in a repository
@Injectable()
export class UserRepository {
  constructor(
    private config: Config,
    private logger: Logger
  ) {
    this.logger.setContext('UserRepository');
  }

  async findById(id: string): Promise<User | null> {
    const port = this.config.get<number>('PORT');
    this.logger.debug(`Server running on port ${port}`);
    // ...rest of method
  }
}
```

## Testing with TypeDI

TypeDI makes testing easier by allowing you to replace real implementations with mocks. There are two main approaches:

### 1. Using Container.set to Override Dependencies

```typescript
// src/domains/users/users.service.test.ts
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<UserRepository>;

  beforeEach(() => {
    // Create mock repository
    mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
    };

    // Override the real repository with our mock
    Container.set(UserRepository, mockUserRepository);

    // Get the service with the injected mock
    userService = Container.get(UserService);
  });

  afterEach(() => {
    // Reset container to prevent test pollution
    Container.reset();
  });

  it('should return a user when found', async () => {
    const user = await userService.getUserById('123');

    expect(user).toEqual({ id: '123', name: 'Test User' });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
  });
});
```

### 2. Using Jest's Manual Mocks

For more complex scenarios, create manual constructor-based injection:

```typescript
// src/domains/users/users.service.test.ts
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { Logger } from '@src/shared/utils/logger/logger.util';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<UserRepository>;
  let mockLogger: Partial<Logger>;

  beforeEach(() => {
    // Create mocks
    mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
    };

    mockLogger = {
      setContext: jest.fn().mockReturnThis(),
      info: jest.fn(),
      error: jest.fn(),
    };

    // Create service with manual injection
    userService = new UserService(
      mockUserRepository as UserRepository,
      mockLogger as Logger
    );
  });

  it('should log and return a user when found', async () => {
    const user = await userService.getUserById('123');

    expect(user).toEqual({ id: '123', name: 'Test User' });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('123')
    );
  });
});
```

## Best Practices

1. **Mark All Injectables** - Always use `@Injectable()` on classes that will be injected.

2. **Constructor Injection** - Use constructor injection rather than property or method injection.

3. **Interface Segregation** - Inject only what you need. Don't inject the entire Config if you only need one setting.

4. **Circular Dependencies** - Avoid circular dependencies between injectable classes.

5. **Use Interfaces for Repositories** - Consider defining interfaces for repositories for better testability.

6. **Reset Container in Tests** - Always reset the container in the `afterEach` hook to avoid test pollution.

7. **Don't Overuse DI** - Not everything needs to be injectable. Use it for services, repositories, and controllers.

## Service Lifetime Management

By default, TypeDI services are singletons. One instance is created and reused throughout the application. This is usually desired for services like Logger, Config, and Repositories.

For per-request scoping, additional configuration is required. See the TypeDI documentation for details on service scoping.

## Example Folder Structure

```
src/
  ├── domains/
  │   └── users/
  │       ├── user.model.ts            # Entity model
  │       ├── users.repository.ts      # Data access layer
  │       ├── users.service.ts         # Business logic layer
  │       ├── users.controller.ts      # HTTP handling layer
  │       ├── users.service.test.ts    # Service tests
  │       └── users.repository.test.ts # Repository tests
  ├── shared/
  │   └── utils/
  │       ├── typedi/
  │       │   └── typedi.util.ts       # TypeDI exports
  │       ├── logger/
  │       │   └── logger.util.ts       # Injectable logger
  │       └── config/
  │           └── config.util.ts       # Injectable configuration
```

## Conclusion

TypeDI provides a powerful way to manage dependencies in your application. By following these patterns, you'll make your code more modular, testable, and maintainable.

Always consider whether injection is necessary for a particular class. For simple utility functions or value objects, plain imports may be cleaner and more appropriate than dependency injection.
