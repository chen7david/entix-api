# Validation Middleware

This document describes the validation middleware system that leverages Zod for request validation in the Entix API.

## Overview

The validation middleware provides a simple, type-safe way to validate incoming requests using Zod schemas. It supports validation of request body, URL parameters, query parameters, headers, and cookies.

## Features

- Strongly-typed validation using Zod schemas
- Support for all parts of the request (body, params, query, headers, cookies)
- Automatic integration with the global error handling system
- Optional stripping of unknown properties
- Custom error messages
- Designed specifically for routing-controllers decorators

## Installation

The validation middleware is already included in the Entix API project. It uses Zod, which is listed as a project dependency.

## Basic Usage

The validation middleware is designed to be used with routing-controllers decorators.

```typescript
import { Controller, Post, UseBefore } from 'routing-controllers';
import { z } from 'zod';
import { ValidateBody, ValidateParams, ValidateQuery } from '@src/middleware/validation.middleware';

// Define your Zod schema
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

@Controller('/users')
export class UserController {
  @Post('/')
  @UseBefore(ValidateBody(userSchema))
  createUser(req: Request, res: Response) {
    // req.body is now validated and typed as { name: string, email: string, age?: number }
    const user = req.body;
    // ... your controller logic
    return { id: 1, ...user };
  }

  @Get('/:id')
  @UseBefore(ValidateParams(z.object({ id: z.string().uuid() })))
  getUserById(req: Request) {
    const { id } = req.params;
    // ... your controller logic
    return { id, name: 'John Doe' };
  }

  @Get('/')
  @UseBefore(
    ValidateQuery(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
      }),
    ),
  )
  searchUsers(req: Request) {
    const { search, limit, page } = req.query;
    // ... your controller logic
    return { users: [], total: 0 };
  }
}
```

## API Reference

### Factory Functions

#### `ValidationMiddleware(schema, target, options)`

The core factory function that creates a class-based middleware for routing-controllers.

- **schema**: A Zod schema defining the validation rules
- **target**: What part of the request to validate (from `ValidationTarget` enum)
- **options**: Optional configuration

#### `ValidateBody(schema, options)`

Convenience factory function for creating a middleware class that validates request body.

#### `ValidateParams(schema, options)`

Convenience factory function for creating a middleware class that validates route parameters.

#### `ValidateQuery(schema, options)`

Convenience factory function for creating a middleware class that validates query parameters.

#### `ValidateHeaders(schema, options)`

Convenience factory function for creating a middleware class that validates request headers.

#### `ValidateCookies(schema, options)`

Convenience factory function for creating a middleware class that validates cookies.

### Enums

#### `ValidationTarget`

Specifies which part of the request to validate:

- `BODY` - Request body (default)
- `PARAMS` - Route parameters
- `QUERY` - Query string parameters
- `HEADERS` - HTTP headers
- `COOKIES` - Cookies

### Options

#### `ValidationOptions`

Configuration options for the validation middleware:

- **errorMessage**: Custom error message to use when validation fails
- **stripUnknown**: Whether to remove properties not defined in the schema (only applies to object schemas)

## Error Handling

When validation fails, the middleware throws a `ValidationError` that is caught by the global error handler, which returns a standardized error response:

```json
{
  "status": 422,
  "type": "validation",
  "message": "Invalid request body",
  "details": [
    {
      "path": "email",
      "message": "Invalid email",
      "code": "invalid_string"
    },
    {
      "path": "age",
      "message": "Expected number, received string",
      "code": "invalid_type"
    }
  ]
}
```

## Examples

### Complex Object Validation

```typescript
import { Controller, Post, UseBefore } from 'routing-controllers';
import { ValidateBody } from '@src/middleware/validation.middleware';
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
  country: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18),
  address: addressSchema,
  tags: z.array(z.string()).min(1).max(5),
});

@Controller('/users')
export class UserController {
  @Post('/')
  @UseBefore(ValidateBody(userSchema))
  createUser(req: Request, res: Response) {
    // req.body is fully validated including the nested address object
    const user = req.body;
    // ...
  }
}
```

### Stripping Unknown Properties

```typescript
import { Controller, Post, UseBefore } from 'routing-controllers';
import { ValidateBody } from '@src/middleware/validation.middleware';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

@Controller('/auth')
export class AuthController {
  @Post('/register')
  @UseBefore(ValidateBody(schema, { stripUnknown: true }))
  register(req: Request, res: Response) {
    // Any properties other than name and email will be removed from req.body
    console.log(req.body); // Only contains name and email
    // ...
  }
}
```

### Custom Error Message

```typescript
import { Controller, Post, UseBefore } from 'routing-controllers';
import { ValidateBody } from '@src/middleware/validation.middleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

@Controller('/auth')
export class AuthController {
  @Post('/login')
  @UseBefore(ValidateBody(loginSchema, { errorMessage: 'Invalid login credentials' }))
  login(req: Request, res: Response) {
    // If validation fails, the error message will be "Invalid login credentials"
    // ...
  }
}
```

### Multiple Validation Middleware

```typescript
import { Controller, Get, UseBefore } from 'routing-controllers';
import { ValidateParams, ValidateQuery } from '@src/middleware/validation.middleware';
import { z } from 'zod';

@Controller('/api')
export class SearchController {
  @Get('/search/:category')
  @UseBefore(ValidateParams(z.object({ category: z.enum(['users', 'products', 'orders']) })))
  @UseBefore(
    ValidateQuery(
      z.object({
        term: z.string().min(2),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    ),
  )
  search(req: Request) {
    // Both route parameters and query parameters are validated
    const { category } = req.params;
    const { term, page, limit } = req.query;
    // ...
  }
}
```

## Best Practices

1. **Define schemas separately** - For reusability and readability, define Zod schemas in separate files or at module level.

2. **Use type inference** - Use Zod's type inference to get TypeScript types from your schemas:

   ```typescript
   const userSchema = z.object({...});
   type User = z.infer<typeof userSchema>;
   ```

3. **Apply validation early** - Apply validation middleware as early as possible in your request handling chain using `@UseBefore`.

4. **Be specific** - Create specific schemas for each endpoint rather than using overly permissive schemas.

5. **Consider performance** - For high-traffic routes, keep validation schemas simple to minimize overhead.

6. **Strip unknown properties** - Use the `stripUnknown` option for security-sensitive endpoints to prevent unwanted data.
