# Dependency Injection with TypeDI

This document outlines how dependency injection is implemented in the Entix API using TypeDI.

## Introduction to TypeDI

TypeDI is a dependency injection tool for TypeScript and JavaScript applications. It provides a way to organize and manage dependencies in a clean, testable, and maintainable manner.

In our application, TypeDI helps us:

1. Decouple components for better testability
2. Organize code using the dependency inversion principle
3. Simplify the creation and management of service instances
4. Facilitate domain-driven design patterns

## Setup and Configuration

TypeDI is configured in our application through several key files:

1. `src/infrastructure/inversify/container.ts` - Contains the core TypeDI container setup
2. `src/infrastructure/inversify/container-loader.ts` - Handles automatic loading of injectable components
3. Various module-specific container configuration files

### Basic Configuration

```typescript
// In container.ts
import { Container } from 'typedi';
import { ContainerLoader } from './container-loader';

// Configure TypeDI
Container.global = new Container();

// Load components into the container
new ContainerLoader().loadControllers();
new ContainerLoader().loadServices();

export { Container };
```

## Using Dependency Injection

### Creating Injectable Services

To make a class injectable, use the `@Injectable()` decorator:

```typescript
import { Injectable } from 'typedi';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
```

### Constructor Injection

The most common pattern is constructor injection, where dependencies are passed through the constructor:

```typescript
@Injectable()
export class OrderService {
  constructor(
    private userService: UserService,
    private productService: ProductService,
    private logger: LoggerService,
  ) {}

  async createOrder(userId: string, productIds: string[]): Promise<Order> {
    // Implementation using injected services
  }
}
```

### Service Resolution

Services are resolved automatically by TypeDI when they're injected into other services or controllers:

```typescript
// TypeDI resolves these dependencies automatically
const userService = Container.get(UserService);
```

## Organizing Services by Domain

We organize our services following domain-driven design principles:

```
src/
├── domain/
│   ├── user/
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.entity.ts
│   ├── product/
│   │   ├── product.service.ts
│   │   └── ...
```

Each domain has its own services, repositories, and entities, all using dependency injection for clean architecture.

## Advanced TypeDI Features

### Using Service Tokens

For more flexible service resolution, we can use service tokens:

```typescript
// Define a token
export const LOGGER_TOKEN = new Token<LoggerService>('logger');

// Register a service with the token
Container.set(LOGGER_TOKEN, new ConsoleLoggerService());

// Inject using the token
@Injectable()
export class UserService {
  constructor(@Inject(LOGGER_TOKEN) private logger: LoggerService) {}
}
```

### Factory Services

For more complex service creation, we use factory services:

```typescript
@Service()
export class DatabaseConnectionFactory {
  createConnection(config: DbConfig): DbConnection {
    // Create and return a connection based on config
  }
}

@Service()
export class UserRepository {
  private connection: DbConnection;

  constructor(private connectionFactory: DatabaseConnectionFactory) {
    this.connection = this.connectionFactory.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
    });
  }
}
```

## Testing with TypeDI

TypeDI makes testing much simpler by allowing easy mocking of dependencies:

```typescript
// In a test file
import { Container } from 'typedi';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create mock
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    // Reset container
    Container.reset();

    // Register mock in container
    Container.set(UserRepository, mockUserRepository);

    // Get service with mocked dependency
    userService = Container.get(UserService);
  });

  it('should find a user by id', async () => {
    const user = { id: '1', name: 'Test User' };
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await userService.findUserById('1');

    expect(result).toEqual(user);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
  });
});
```

## Best Practices

### Use Interfaces for Dependencies

Define interfaces for services to make dependencies more explicit and improve testability:

```typescript
// Define interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Implement the interface
@Injectable()
export class UserRepository implements IUserRepository {
  // Implementation
}

// Inject using the interface type
@Injectable()
export class UserService {
  constructor(private userRepository: IUserRepository) {}
}
```

### Avoid Circular Dependencies

Circular dependencies can cause issues with TypeDI. Avoid them by:

1. Restructuring your code to eliminate the circular dependency
2. Using a mediator service that both dependent services can use
3. Using the `@Lazy()` decorator if absolutely necessary

### Keep Services Focused

Each service should have a single responsibility. This ensures better testability and maintainability:

```typescript
// Good: Focused service
@Injectable()
export class UserAuthenticationService {
  constructor(private userRepository: UserRepository) {}

  async authenticate(email: string, password: string): Promise<User | null> {
    // Authentication logic
  }
}

// Good: Another focused service
@Injectable()
export class UserProfileService {
  constructor(private userRepository: UserRepository) {}

  async updateProfile(userId: string, profile: ProfileData): Promise<User> {
    // Profile update logic
  }
}
```

### Use Value Services for Configuration

For configuration values, use value services:

```typescript
// Register configuration
Container.set('database.config', {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
});

// Inject configuration
@Injectable()
export class DatabaseService {
  constructor(@Inject('database.config') private dbConfig: DbConfig) {}
}
```

## Automatic Service Loading

Our application uses automatic service loading via a pattern-based system:

```typescript
// In container-loader.ts
import { Container } from 'typedi';
import glob from 'glob';
import path from 'path';

export class ContainerLoader {
  loadServices(): void {
    const serviceFiles = glob.sync(path.join(__dirname, '../../**/*.service.ts'));

    serviceFiles.forEach(file => {
      // Dynamic import of service files
      require(file);
    });
  }

  loadControllers(): void {
    const controllerFiles = glob.sync(path.join(__dirname, '../../**/*.controller.ts'));

    controllerFiles.forEach(file => {
      // Dynamic import of controller files
      require(file);
    });
  }
}
```

This pattern automatically finds and loads all files matching the pattern, allowing TypeDI to register them in the container.

## Conclusion

Using TypeDI for dependency injection in our application provides numerous benefits:

1. **Cleaner architecture**: Dependencies are explicitly defined and managed
2. **Improved testability**: Services can be easily mocked for testing
3. **Reduced coupling**: Components are decoupled, making the system more maintainable
4. **Better organization**: Services are organized by domain, following DDD principles

By following the guidelines in this document, you'll be able to effectively use TypeDI in your development work with our codebase.
