---
title: Routing Controllers
---

# Routing Controllers

This guide explains how routing is implemented in Entix API using the routing-controllers framework.

## Overview

Entix API uses [routing-controllers](https://github.com/typestack/routing-controllers) to create a declarative, decorator-based routing system that integrates well with TypeScript.

## Basic Controller Setup

```typescript
import { Controller, Get, Post, Body, Param } from 'routing-controllers';
import { Service } from 'typedi';

@Controller('/users')
@Service()
export class UsersController {
  @Get('/')
  getAllUsers() {
    // Implementation
    return { users: [] };
  }

  @Get('/:id')
  getUserById(@Param('id') id: string) {
    // Implementation
    return { user: { id } };
  }

  @Post('/')
  createUser(@Body() userData: any) {
    // Implementation
    return { user: userData };
  }
}
```

## Controller Registration

Controllers are registered in `app.ts`:

```typescript
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { UsersController } from './features/users/users.controller';
import { HealthController } from './features/health/health.controller';

// Use TypeDI container
useContainer(Container);

const app = createExpressServer({
  controllers: [UsersController, HealthController],
  middlewares: [
    // Global middlewares
  ],
  defaultErrorHandler: false,
});

export default app;
```

## Request Handling

### Path Parameters

```typescript
@Get('/:id')
getUserById(@Param('id') id: string) {
  // Implementation
}
```

### Query Parameters

```typescript
@Get('/')
getUsers(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number) {
  // Implementation
}
```

### Request Body

```typescript
@Post('/')
createUser(@Body() userData: any) {
  // Implementation
}
```

## Response Handling

### Status Codes

```typescript
@Post('/')
@HttpCode(201)
createUser(@Body() userData: any) {
  // Implementation
}
```

### Response Headers

```typescript
@Get('/:id')
@Header('Cache-Control', 'max-age=3600')
getUserById(@Param('id') id: string) {
  // Implementation
}
```

## Error Handling

```typescript
@Get('/:id')
getUserById(@Param('id') id: string) {
  const user = findUser(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}
```

## Best Practices

1. Group controllers by feature/domain
2. Keep controllers focused on HTTP concerns
3. Delegate business logic to services
4. Use appropriate HTTP status codes
5. Validate input data before processing
