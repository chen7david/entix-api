---
title: Dependency Injection
---

# Dependency Injection

This guide explains how dependency injection is implemented in Entix API using TypeDI.

## Overview

Entix API uses [TypeDI](https://github.com/typestack/typedi) for dependency injection, which helps manage dependencies and promotes testable, loosely coupled code.

## Configuration

The dependency injection system is configured in `src/config/di.config.ts`:

```typescript
// Dependency injection configuration
import { Container } from 'typedi';
import { LoggerService } from '../services/logger.service';

// Configure global DI container
Container.set('logger', new LoggerService());

export default Container;
```

## Using Dependency Injection

### In Controllers

```typescript
import { Controller, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { LoggerService } from '../services/logger.service';

@Controller('/users')
@Service()
export class UsersController {
  constructor(@Inject('logger') private logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.info('Fetching all users');
    // Implementation
  }
}
```

### In Services

```typescript
import { Inject, Service } from 'typedi';
import { LoggerService } from './logger.service';

@Service()
export class UserService {
  constructor(@Inject('logger') private logger: LoggerService) {}

  async findAll() {
    this.logger.info('Finding all users in service');
    // Implementation
  }
}
```

## Best Practices

1. Always use the `@Service()` decorator for classes that should be managed by TypeDI
2. Use constructor injection rather than property injection
3. Consider using symbols for token identification in larger applications
4. Create factory functions for complex service instantiation
