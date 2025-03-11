# Dependency Injection Guide

This project uses TypeDI for dependency injection, integrated with routing-controllers.

## Basic Usage

### Creating a Service

To create a service that can be injected:

```typescript
import { Service } from 'typedi';

@Service()
export class MyService {
  constructor() {
    // Service initialization
  }

  public doSomething() {
    return 'result';
  }
}
```

### Using a Service in a Controller

To use a service in a controller:

```typescript
import { JsonController, Get } from 'routing-controllers';
import { Service } from 'typedi';
import { MyService } from './my.service';

@JsonController('/resource')
@Service() // Important: Controllers must also be decorated with @Service
export class MyController {
  constructor(private myService: MyService) {}

  @Get()
  getAll() {
    return this.myService.doSomething();
  }
}
```

### Using a Service in Middleware

To use a service in middleware:

```typescript
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { MyService } from './my.service';

@Middleware({ type: 'before' })
@Service()
export class MyMiddleware implements ExpressMiddlewareInterface {
  constructor(private myService: MyService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    // Use the service
    this.myService.doSomething();
    next();
  }
}
```

## Advanced Usage

### Service with Dependencies

Services can depend on other services:

```typescript
import { Service } from 'typedi';

@Service()
export class DependentService {
  constructor(private otherService: OtherService) {}
}
```

### Manual Injection

You can manually get services from the container:

```typescript
import { Container } from 'typedi';
import { MyService } from './my.service';

const myService = Container.get(MyService);
```

### Scoped Services

By default, services are singletons. For scoped services, you can use:

```typescript
import { Service, ContainerInstance } from 'typedi';

@Service({ transient: true })
export class TransientService {
  // This service will be instantiated each time it's requested
}
```

## Best Practices

1. **Keep services focused**: Each service should have a single responsibility.
2. **Use interfaces**: Define interfaces for your services to improve testability.
3. **Avoid circular dependencies**: Structure your services to avoid circular dependencies.
4. **Use constructor injection**: Always use constructor injection rather than property injection.
5. **Test with mocks**: When testing components that use services, create mock implementations.
