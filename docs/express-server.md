# Express Server Setup with Routing-Controllers

This document outlines the architecture and design choices made for the Express server implementation in the Entix API project.

## Architecture Overview

The Express server setup in Entix API follows a modular architecture with clear separation of concerns:

1. **server.ts** - The entry point for the application that bootstraps the HTTP server
2. **app.ts** - Contains the Express application setup and routing-controllers configuration
3. **controllers/** - Directory for all controller classes that define API endpoints

This modular approach offers several benefits:

- Improved testability by allowing the Express app to be tested without starting the HTTP server
- Better separation of concerns between server configuration and application logic
- Easier extension and maintenance of the codebase

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
- Routing-controllers setup
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

### Controllers

Controllers follow the decorator-based approach provided by the routing-controllers library:

```typescript
@JsonController('/users')
class UserController {
  @Get('/')
  getAll(): User[] {
    // ...
  }

  @Get('/:id')
  getOne(@Param('id') id: string): User {
    // ...
  }

  // ...
}
```

## Design Decisions

### Why Routing-Controllers?

We chose routing-controllers for several reasons:

1. **Decorator-based routing** - Provides a clean, TypeScript-friendly way to define routes
2. **Validation and transformation** - Built-in support for request validation and data transformation
3. **Modularity** - Encourages organization of endpoints into controller classes
4. **TypeScript integration** - First-class support for TypeScript types and decorators

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

### Adding a New Controller

To add a new controller:

1. Create a new file in the `controllers/` directory
2. Define a controller class with routing-controllers decorators
3. Use the appropriate HTTP method decorators (`@Get`, `@Post`, etc.)
4. Export the controller class
5. Import and add the controller to the `controllers` array in `app.ts`

Example:

```typescript
// controllers/product.controller.ts
import { JsonController, Get, Param } from 'routing-controllers';
import { logger } from '@src/services/logger.service';

@JsonController('/products')
export class ProductController {
  @Get('/')
  getAllProducts() {
    logger.info('Getting all products');
    return { products: [] };
  }

  @Get('/:id')
  getProduct(@Param('id') id: string) {
    logger.info(`Getting product with id ${id}`);
    return { id, name: 'Sample Product' };
  }
}
```

Then in `app.ts`:

```typescript
// app.ts
import { ProductController } from './controllers/product.controller';

// ...
private setupControllers(): void {
  useExpressServer(this.app, {
    controllers: [
      TestController,
      ProductController
    ],
    // ...
  });
}
```

### Adding Middleware

To add custom middleware to the Express application:

1. Define your middleware function
2. Add it to the middleware setup in the `setupMiddleware` method of the `App` class

Example:

```typescript
// Adding a request ID middleware
this.app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});
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
2. **Validation** - Use class-validator decorators for request validation
3. **Error handling** - Use proper error handling and status codes
4. **Logging** - Log important events with appropriate log levels
5. **Testing** - Write tests for all new controllers and middleware
6. **Security** - Follow security best practices for APIs
7. **Documentation** - Update this document when making significant changes

By following these guidelines, we can maintain a clean, efficient, and maintainable Express server implementation.
