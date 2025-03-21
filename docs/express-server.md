# Express Server Setup with Routing-Controllers

This document outlines the architecture and design choices made for the Express server implementation in the Entix API project.

## Architecture Overview

The Express server setup in Entix API follows a domain-driven architecture with clear separation of concerns:

1. **server.ts** - The entry point for the application that bootstraps the HTTP server
2. **app.ts** - Contains the Express application setup and routing-controllers configuration
3. **domains/** - Directory for all domain-specific modules, following domain-driven design principles
   - Each domain has its own folder containing controllers, services, and other related files
   - Controllers are responsible for handling HTTP requests and delegating to services
   - Services contain the business logic and are injectable

This modular approach offers several benefits:

- Improved testability by allowing the Express app to be tested without starting the HTTP server
- Better separation of concerns between server configuration, controllers, and business logic
- Easier extension and maintenance of the codebase
- Clear boundaries between different domains of the application

## Key Components

### Server (server.ts)

The `server.ts` file is responsible for:

- Bootstrapping the Express application
- Creating an HTTP server
- Setting up error handling for server failures
- Managing graceful shutdown on SIGTERM signals
- Configuring environment-specific behavior

### Application (app.ts)

The `app.ts` file contains:

- Express application initialization
- Middleware configuration (CORS, JSON parsing, etc.)
- Routing-controllers setup with TypeDI integration
- Logging configuration

The `App` class provides a clean way to encapsulate the Express application setup:

```typescript
export class App {
  public app: express.Application;

  constructor(config: AppConfig = { cors: true, detailedLogging: true }) {
    this.app = express();
    this.setupMiddleware(config);
    this.setupControllers();
  }

  // ...
}
```

### Controllers and Services

Controllers follow the decorator-based approach provided by the routing-controllers library and are integrated with TypeDI for dependency injection:

```typescript
@JsonController('/users')
@Injectable()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/:id')
  getOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  // ...
}
```

Services contain the business logic and are injected into controllers:

```typescript
@Injectable()
export class UserService {
  async findAll(): Promise<User[]> {
    // Business logic for finding all users
  }

  async findById(id: string): Promise<User> {
    // Business logic for finding a user by ID
  }

  // ...
}
```

## Design Decisions

### Why Routing-Controllers?

We chose routing-controllers for several reasons:

1. **Decorator-based routing** - Provides a clean, TypeScript-friendly way to define routes
2. **TypeDI integration** - Seamless integration with dependency injection
3. **Modularity** - Encourages organization of endpoints into controller classes
4. **TypeScript integration** - First-class support for TypeScript types and decorators

### Dependency Injection with TypeDI

We use TypeDI for dependency injection to improve:

1. **Testability** - Services can be easily mocked for testing
2. **Decoupling** - Components are loosely coupled and depend on abstractions
3. **Lifecycle management** - Services can be configured as singletons or scoped instances

The `@Injectable()` decorator (an alias for TypeDI's `@Service()`) is used to mark classes that can be injected.

### Validation with Zod

We use Zod for validation instead of class-validator:

1. **Type safety** - Zod provides better type inference and validation
2. **Simplicity** - No need for decorators on DTOs
3. **Flexibility** - Easier to compose and reuse validation schemas

### CORS Configuration

CORS is configured to allow cross-origin requests with specific constraints:

- All origins are allowed (`*`) for development simplicity
- Only necessary HTTP methods are permitted
- Only required headers are allowed

In production, consider restricting the `origin` to specific domains.

### Logging Strategy

The server uses a structured logging approach:

- Request/response logging at appropriate levels
- Performance metrics for request duration
- Correlation IDs for request tracing
- Environment-specific log formatting (pretty printing in development)

All logging is done through the centralized logger service to ensure consistency.

### Error Handling

The server implements multi-layered error handling:

- Express-level error handling for unexpected errors
- Routing-controllers error handling for validation errors
- Global process-level error handling for uncaught exceptions

## Adding New Functionality

### Adding a New Domain

To add a new domain:

1. Create a new directory in the `domains/` folder with a descriptive name
2. Create controller, service, and other related files within this directory
3. Controllers will be automatically discovered and registered

### Adding a New Controller

To add a new controller:

1. Create a new file with a `.controller.ts` suffix in the appropriate domain directory
2. Define a controller class with routing-controllers decorators
3. Use the appropriate HTTP method decorators (`@Get`, `@Post`, etc.)
4. Export the controller class
5. Decorate the class with `@Injectable()`

Example:

```typescript
// domains/products/product.controller.ts
import { JsonController, Get, Param } from 'routing-controllers';
import { Injectable } from '@src/utils/typedi.util';
import { logger } from '@src/services/logger.service';
import { ProductService } from './product.service';

@JsonController('/products')
@Injectable()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/')
  getAllProducts() {
    logger.info('Getting all products');
    return this.productService.findAll();
  }

  @Get('/:id')
  getProduct(@Param('id') id: string) {
    logger.info(`Getting product with id ${id}`);
    return this.productService.findById(id);
  }
}
```

### Adding a New Service

To add a new service:

1. Create a new file with a `.service.ts` suffix in the appropriate domain directory
2. Define a service class with the business logic
3. Export the service class
4. Decorate the class with `@Injectable()`

Example:

```typescript
// domains/products/product.service.ts
import { Injectable } from '@src/utils/typedi.util';
import { logger } from '@src/services/logger.service';

@Injectable()
export class ProductService {
  async findAll() {
    logger.debug('ProductService.findAll called');
    // Business logic for finding all products
    return [{ id: '1', name: 'Product 1' }];
  }

  async findById(id: string) {
    logger.debug(`ProductService.findById called with id: ${id}`);
    // Business logic for finding a product by ID
    return { id, name: `Product ${id}` };
  }
}
```

### Adding Middleware

To add custom middleware to the Express application:

1. Define your middleware class that implements `ExpressMiddlewareInterface`
2. Decorate it with `@Middleware()` and `@Injectable()`
3. Add it to the middlewares array in the `setupControllers` method of the `App` class

Example:

```typescript
// middleware/logging.middleware.ts
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Injectable } from '@src/utils/typedi.util';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@src/services/logger.service';

@Middleware({ type: 'before' })
@Injectable()
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    const context = logger.createRequestContext(request);
    logger.info(`${request.method} ${request.path}`, context);
    next();
  }
}
```

## Testing

The server and application are designed to be easily testable:

1. **Unit tests** - Test individual components in isolation
2. **Integration tests** - Test the interaction between components
3. **API tests** - Test the API endpoints using Supertest

Example of testing an API endpoint:

```typescript
import request from 'supertest';
import { createApp } from '@src/app';

describe('API Endpoints', () => {
  it('should return 200 for a valid endpoint', async () => {
    const app = createApp();
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

When working with the Express server, follow these best practices:

1. **Route organization** - Keep related routes in the same controller
2. **Domain-driven design** - Organize code by domain, not by technical layers
3. **Error handling** - Use proper error handling and status codes
4. **Logging** - Log important events with appropriate log levels
5. **Testing** - Write tests for all new controllers and services
6. **Security** - Follow security best practices for APIs
7. **Documentation** - Update this document when making significant changes
8. **TSDoc comments** - Add TSDoc-compliant comments to all functions and methods

By following these guidelines, we can maintain a clean, efficient, and maintainable Express server implementation.
