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
- Compatible with routing-controllers decorators

## Installation

The validation middleware is already included in the Entix API project. It uses Zod, which is listed as a project dependency.

## Basic Usage

There are two main ways to use the validation middleware, depending on whether you're using routing-controllers decorators or traditional Express middleware.

### With routing-controllers

```typescript
import { Controller, Post, UseBefore } from 'routing-controllers';
import { z } from 'zod';
import { ValidationMiddleware, ValidationTarget } from '@src/middleware/validation.middleware';

// Define your Zod schema
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

@Controller('/users')
export class UserController {
  @Post('/')
  @UseBefore(ValidationMiddleware(userSchema, ValidationTarget.BODY))
  createUser(req: Request, res: Response) {
    // req.body is now validated and typed as { name: string, email: string, age?: number }
    const user = req.body;
    // ... your controller logic
    return { id: 1, ...user };
  }
}
```

### As Express Middleware

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '@src/middleware/validation.middleware';

const router = Router();

// Define Zod schemas
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const searchQuerySchema = z.object({
  query: z.string().min(2).optional(),
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
});

// Apply validation middleware to routes
router.post('/users', validateBody(userSchema), (req, res) => {
  // req.body is now validated
  // ...
});

router.get('/users/:id', validateParams(idParamSchema), (req, res) => {
  // req.params is now validated
  const { id } = req.params;
  // ...
});

router.get('/search', validateQuery(searchQuerySchema), (req, res) => {
  // req.query is now validated and transformed
  const { query, limit, page } = req.query;
  // ...
});
```

## API Reference

### Functions

#### `validate(schema, target, options)`

The core function that creates a validation middleware.

- **schema**: A Zod schema defining the validation rules
- **target**: What part of the request to validate (from `ValidationTarget` enum)
- **options**: Optional configuration

#### `validateBody(schema, options)`

Convenience function for validating request body.

#### `validateParams(schema, options)`

Convenience function for validating route parameters.

#### `validateQuery(schema, options)`

Convenience function for validating query parameters.

#### `validateHeaders(schema, options)`

Convenience function for validating request headers.

#### `ValidationMiddleware(schema, target, options)`

Factory function that creates a class-based middleware for use with routing-controllers.

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
import { validateBody } from '@src/middleware/validation.middleware';
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

router.post('/users', validateBody(userSchema), (req, res) => {
  // req.body is fully validated including the nested address object
  const user = req.body;
  // ...
});
```

### Stripping Unknown Properties

```typescript
import { validateBody } from '@src/middleware/validation.middleware';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

router.post('/register', validateBody(schema, { stripUnknown: true }), (req, res) => {
  // Any properties other than name and email will be removed from req.body
  console.log(req.body); // Only contains name and email
  // ...
});
```

### Custom Error Message

```typescript
import { validateBody } from '@src/middleware/validation.middleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post(
  '/login',
  validateBody(loginSchema, { errorMessage: 'Invalid login credentials' }),
  (req, res) => {
    // If validation fails, the error message will be "Invalid login credentials"
    // ...
  },
);
```

## Best Practices

1. **Define schemas separately** - For reusability and readability, define Zod schemas in separate files or at module level.

2. **Use type inference** - Use Zod's type inference to get TypeScript types from your schemas:

   ```typescript
   const userSchema = z.object({...});
   type User = z.infer<typeof userSchema>;
   ```

3. **Validate early** - Apply validation middleware as early as possible in your request handling chain.

4. **Be specific** - Create specific schemas for each endpoint rather than using overly permissive schemas.

5. **Consider performance** - For high-traffic routes, keep validation schemas simple to minimize overhead.

6. **Strip unknown properties** - Use the `stripUnknown` option for security-sensitive endpoints to prevent unwanted data.
