---
title: Authentication
---

# Authentication

This guide explains how authentication is implemented in Entix API.

## Overview

Entix API implements authentication to secure API endpoints and identify users making requests.

## Authentication Middleware

Authentication is handled by middleware that verifies credentials and attaches user information to the request:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { LoggerService } from '../services/logger.service';
import { UnauthorizedError } from './errors';

@Middleware({ type: 'before' })
@Service()
export class AuthMiddleware implements ExpressMiddlewareInterface {
  constructor(private logger: LoggerService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);

      if (!token) {
        throw new UnauthorizedError('Authentication token is missing');
      }

      // Verify token and get user
      const user = await this.verifyToken(token);

      // Attach user to request
      req.user = user;

      next();
    } catch (error) {
      next(new UnauthorizedError((error as Error).message));
    }
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private async verifyToken(token: string) {
    // Implementation of token verification
    // This would typically involve:
    // 1. Verifying the token's signature
    // 2. Checking that it hasn't expired
    // 3. Looking up the associated user

    // Mock implementation
    return { id: '123', username: 'user' };
  }
}
```

## Protecting Routes

You can protect routes using the `@UseMiddleware` decorator:

```typescript
import { Controller, Get, UseMiddleware } from 'routing-controllers';
import { Service } from 'typedi';
import { AuthMiddleware } from '../../middleware/auth.middleware';

@Controller('/users')
@Service()
export class UsersController {
  @Get('/profile')
  @UseMiddleware(AuthMiddleware)
  getProfile(req: Request & { user?: any }) {
    return {
      user: req.user,
    };
  }
}
```

You can also apply authentication to all routes in a controller:

```typescript
@Controller('/users')
@UseMiddleware(AuthMiddleware)
@Service()
export class UsersController {
  // All routes in this controller require authentication
}
```

## Current User Decorator

For convenience, you can create a custom decorator to access the current user:

```typescript
import { createParamDecorator } from 'routing-controllers';
import { UnauthorizedError } from '../middleware/errors';

export function CurrentUser() {
  return createParamDecorator({
    value: action => {
      const user = action.request.user;

      if (!user) {
        throw new UnauthorizedError('User is not authenticated');
      }

      return user;
    },
  });
}
```

Then use it in your controllers:

```typescript
@Get('/profile')
@UseMiddleware(AuthMiddleware)
getProfile(@CurrentUser() user: any) {
  return { user };
}
```

## Best Practices

1. Use HTTPS for all authenticated requests
2. Set appropriate token expiration times
3. Implement token refresh mechanisms
4. Use secure, HttpOnly cookies for storing tokens when appropriate
5. Include proper CORS configuration for cross-domain requests
