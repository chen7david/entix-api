---
title: Validation
---

# Validation

This guide explains how request validation is implemented in Entix API using Zod.

## Overview

Entix API uses [Zod](https://github.com/colinhacks/zod) for validating incoming requests, which provides a type-safe and declarative way to define validation schemas.

## Validation Schemas

Validation schemas should be defined in separate files (e.g., `user.schema.ts`) within each feature:

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

## Implementing Validation in Controllers

```typescript
import { Body, Controller, Post } from 'routing-controllers';
import { createUserSchema, CreateUserDto } from './user.schema';

@Controller('/users')
export class UsersController {
  @Post('/')
  createUser(@Body() body: unknown) {
    // Validate the request body
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      throw new Error('Invalid user data');
    }

    const userData: CreateUserDto = result.data;
    // Proceed with creating the user
  }
}
```

## Middleware Approach

For a more declarative approach, you can create a validation middleware:

```typescript
import { Middleware } from 'routing-controllers';
import { z } from 'zod';

export function ValidateBody(schema: z.ZodType) {
  @Middleware({ type: 'before' })
  class ValidateBodyMiddleware {
    use(req: any, res: any, next: any) {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.errors,
        });
      }

      req.body = result.data;
      next();
    }
  }

  return ValidateBodyMiddleware;
}
```

## Best Practices

1. Keep validation schemas close to their related controllers
2. Use Zod's type inference to create TypeScript types from schemas
3. Consider creating reusable schema components for common validation patterns
4. Add meaningful error messages to validation schemas
