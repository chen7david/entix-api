# Validation with Zod

This document outlines how validation is implemented in the Entix API using Zod, including best practices and examples.

## Introduction to Zod

Zod is a TypeScript-first schema validation library that allows us to create powerful validation schemas with excellent type inference. We've chosen Zod over class-validator for several key reasons:

1. **Type Inference**: Zod provides superior TypeScript integration with full type inference.
2. **Runtime Type Safety**: Ensures that runtime values match their TypeScript types.
3. **Composability**: Schemas can be easily composed and reused.
4. **Immutability**: Schemas are immutable, making them easier to reason about.
5. **No Decorators**: Avoids the need for experimental decorator syntax.

## Basic Usage

### Defining Schemas

Zod schemas define both validation rules and TypeScript types:

```typescript
import { z } from 'zod';

// Define a schema for user creation
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

// Infer TypeScript type from schema
export type CreateUserDto = z.infer<typeof createUserSchema>;
```

### Using Schemas for Validation

```typescript
import { createUserSchema, CreateUserDto } from './user.schema';

function createUser(data: unknown): User {
  // Validate and parse input data
  const userData = createUserSchema.parse(data);

  // userData is now typed as CreateUserDto
  return userRepository.create(userData);
}
```

### Handling Validation Errors

Zod provides detailed error information when validation fails:

```typescript
import { z } from 'zod';

function validateUser(data: unknown): CreateUserDto {
  try {
    return createUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Structured error information
      console.error('Validation failed:', error.errors);

      // Format errors for API response
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Invalid user data', formattedErrors);
    }
    throw error;
  }
}
```

## Integration with Express

### Middleware Approach

We use middleware to validate request data before it reaches route handlers:

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@src/errors/validation.error';

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validated = schema.parse(req.body);

      // Replace request body with validated data
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}
```

### Using Validation Middleware

```typescript
import { Router } from 'express';
import { validate } from '@src/middleware/validate.middleware';
import { createUserSchema } from './user.schema';
import { userController } from './user.controller';

const router = Router();

router.post('/users', validate(createUserSchema), userController.createUser);

export { router };
```

## Advanced Zod Features

### Composing Schemas

Schemas can be composed for code reuse:

```typescript
// Base schema for common fields
const userBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Extended schema for user profile
const userProfileSchema = userBaseSchema.extend({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

// Schema for user settings
const userSettingsSchema = z.object({
  userId: z.string().uuid(),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.boolean().default(true),
  language: z.enum(['en', 'fr', 'es']).default('en'),
});

// Combined user schema
const fullUserSchema = userProfileSchema.merge(
  z.object({
    settings: userSettingsSchema,
  }),
);
```

### Transformations

Zod can transform values during validation:

```typescript
const userInputSchema = z.object({
  email: z
    .string()
    .email()
    .transform(email => email.toLowerCase()),
  birthDate: z
    .string()
    .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'String must be in YYYY-MM-DD format',
    })
    .transform(val => new Date(val)),
  tags: z.string().transform(tags => tags.split(',').map(tag => tag.trim())),
});
```

### Custom Validations

You can define custom validations using `refine`:

```typescript
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .refine(
        password => {
          // At least one uppercase, one lowercase, one number, one special char
          const hasUppercase = /[A-Z]/.test(password);
          const hasLowercase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

          return hasUppercase && hasLowercase && hasNumber && hasSpecial;
        },
        {
          message: 'Password must include uppercase, lowercase, number, and special character',
        },
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // Path of the error
  });
```

## Best Practices

### Centralize Schema Definitions

Keep schema definitions in dedicated files, organized by domain:

```
src/
├── domain/
│   ├── user/
│   │   ├── user.schema.ts  // All user-related schemas
│   │   ├── user.service.ts
│   │   └── user.controller.ts
```

### Reuse Schemas

Define base schemas that can be extended or refined:

```typescript
// Base schema
export const userBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});

// Create schema (for POST requests)
export const createUserSchema = userBaseSchema
  .omit({ id: true }) // Remove id field
  .extend({
    password: z.string().min(8),
    role: z.enum(['admin', 'user']).default('user'),
  });

// Update schema (for PATCH requests)
export const updateUserSchema = userBaseSchema
  .omit({ id: true }) // Remove id field
  .partial() // Make all fields optional
  .extend({
    password: z.string().min(8).optional(),
  });
```

### Infer Types from Schemas

Always infer TypeScript types from Zod schemas to ensure type safety:

```typescript
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

// Infer the type
export type User = z.infer<typeof userSchema>;

// Use the inferred type
function processUser(user: User) {
  // Implementation
}
```

### Consistent Error Handling

Standardize how validation errors are handled:

```typescript
// In a central error handling module
export function handleZodError(error: z.ZodError) {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message,
    code: 'validation_error',
  }));
}

// In middleware
import { handleZodError } from '@src/utils/error-handler';

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = handleZodError(error);
        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}
```

## Comparison with Class-Validator

### Advantages of Zod over Class-Validator

1. **Type Inference**

   Zod automatically infers TypeScript types from validation schemas, ensuring perfect alignment between validation and types.

   ```typescript
   // With Zod
   const userSchema = z.object({
     email: z.string().email(),
     age: z.number().int().positive(),
   });

   // Type is inferred
   type User = z.infer<typeof userSchema>;

   // With class-validator
   class UserDto {
     @IsEmail()
     email: string;

     @IsInt()
     @IsPositive()
     age: number;
   }
   ```

2. **No Decorators**

   Zod doesn't rely on TypeScript decorators, which require experimental compiler flags.

3. **Composability**

   Zod schemas are highly composable and can be easily combined, extended, or transformed:

   ```typescript
   // With Zod
   const baseSchema = z.object({ id: z.string() });
   const extendedSchema = baseSchema.extend({ name: z.string() });
   const partialSchema = extendedSchema.partial();

   // With class-validator
   // Requires inheritance, mixins, or other complex patterns
   ```

4. **Immutability**

   Zod schemas are immutable, which helps prevent side effects and makes them safer to use.

5. **Runtime Type Safety**

   Zod ensures that runtime values match their TypeScript types, providing an additional layer of type safety.

## Example: Complete REST Endpoint

Here's a complete example of a REST endpoint using Zod validation:

```typescript
// user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).default('user'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.schema';

export class UserController {
  private userService = Container.get(UserService);

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body is already validated by middleware
      const userData: CreateUserDto = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      // req.body is already validated by middleware
      const userData: UpdateUserDto = req.body;
      const user = await this.userService.updateUser(userId, userData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

// user.routes.ts
import { Router } from 'express';
import { validate } from '@src/middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.schema';
import { UserController } from './user.controller';

const router = Router();
const userController = new UserController();

router.post('/users', validate(createUserSchema), userController.createUser);

router.patch('/users/:id', validate(updateUserSchema), userController.updateUser);

export { router as userRoutes };
```

## Conclusion

Zod provides a powerful, type-safe approach to validation that integrates seamlessly with TypeScript. By following the patterns and best practices outlined in this document, you'll ensure robust validation throughout your application while maintaining excellent developer experience and type safety.

Remember these key points:

1. Use Zod to define schemas that serve as both validation rules and type definitions
2. Infer TypeScript types from Zod schemas to ensure type safety
3. Centralize schema definitions in domain-specific files
4. Reuse and compose schemas to avoid duplication
5. Implement consistent error handling for validation failures

This approach ensures that your application's data validation is robust, maintainable, and fully integrated with TypeScript's type system.
