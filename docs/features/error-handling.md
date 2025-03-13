---
title: Error Handling
---

# Error Handling

This guide explains the error handling strategy in Entix API.

## Overview

Entix API implements a centralized error handling mechanism to ensure consistent error responses and proper logging of errors.

## Error Middleware

Errors are handled by a global middleware in `src/middleware/error.middleware.ts`:

```typescript
import { NextFunction, Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { LoggerService } from '../services/logger.service';

@Middleware({ type: 'after' })
@Service()
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  constructor(private logger: LoggerService) {}

  error(error: any, req: Request, res: Response, next: NextFunction) {
    const status = error.httpCode || error.status || 500;
    const message = error.message || 'Something went wrong';

    // Log the error
    this.logger.error('Request error', error, {
      path: req.path,
      method: req.method,
      status,
    });

    // Send response
    res.status(status).json({
      success: false,
      message,
      errors: error.errors || null,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }
}
```

## Custom Error Classes

To provide more specific error handling, you can define custom error classes:

```typescript
export class ApplicationError extends Error {
  constructor(
    public readonly message: string,
    public readonly httpCode: number = 500,
    public readonly errors?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation failed', errors?: any) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}
```

## Using Custom Errors

```typescript
import { Controller, Get, Param } from 'routing-controllers';
import { Service } from 'typedi';
import { NotFoundError } from '../../middleware/errors';
import { UserService } from './user.service';

@Controller('/users')
@Service()
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

## Handling Async Errors

Routing-controllers automatically handles promise rejections, so you don't need to explicitly catch async errors in your controllers.

## Best Practices

1. Use custom error classes for different error scenarios
2. Include helpful error messages
3. Include additional error details when appropriate
4. Don't expose sensitive information in error responses
5. Log all errors with appropriate context
