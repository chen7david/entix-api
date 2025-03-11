# Dependency Injection Guide

## Basic Usage

### Creating a Service

```typescript
import { Service } from 'typedi';

@Service()
export class MyService {
  constructor() {
    // Service initialization
  }
}
```

### Using in Controllers

```typescript
@JsonController('/resource')
@Service()
export class MyController {
  constructor(private myService: MyService) {}
}
```

## Best Practices

1. Use constructor injection
2. Keep services focused
3. Avoid circular dependencies
4. Use interfaces for better testing
5. Properly scope services (singleton vs transient)

[Full DI Documentation](../api/dependency-injection.md)
