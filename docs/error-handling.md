# Error Handling Guide

This project uses a robust, extensible, and industry-standard error handling system. All errors are handled via a unified `AppError` class hierarchy, with ergonomic constructors and a global error middleware for consistent API responses and logging.

## Table of Contents

- [Overview](#overview)
- [Throwing Errors](#throwing-errors)
- [Error Classes](#error-classes)
- [Usage Examples](#usage-examples)
- [Validation Errors (Zod)](#validation-errors-zod)
- [Best Practices](#best-practices)
- [Custom Errors](#custom-errors)

---

## Overview

- All errors should extend from `AppError` (or its subclasses).
- You can throw errors with either a message string or an options object for full control.
- The global error middleware will catch, log, and format all errors for the client.
- Validation errors (from Zod) are automatically converted to a `ValidationError` with clean details.

---

## Throwing Errors

You can throw errors in your controllers, services, or anywhere in your codebase using the provided error classes.

### With a Message (Ergonomic)

```ts
throw new NotFoundError('User not found');
throw new BadRequestError('Invalid input');
throw new UnauthorizedError('You must be logged in');
throw new ForbiddenError('You do not have permission');
throw new ConflictError('Resource already exists');
throw new RateLimitError('Too many requests');
throw new InternalError('Unexpected server error');
```

### With an Options Object

```ts
throw new NotFoundError({
  message: 'User not found',
  details: [{ path: 'userId', message: 'No user with this ID' }],
  logContext: { userId: 123 },
});

throw new BadRequestError({
  message: 'Invalid email',
  details: [{ path: 'email', message: 'Email is not valid' }],
});

throw new AppError({
  status: 418,
  message: "I'm a teapot",
  expose: true,
});
```

### With Only a Message (Base Class)

```ts
throw new AppError('Something went wrong'); // status defaults to 500
```

---

## Error Classes

All error classes are available from `@shared/utils/error/error.util`:

- `AppError` (base)
- `NotFoundError`
- `BadRequestError`
- `ValidationError`
- `UnauthorizedError`
- `ForbiddenError`
- `ConflictError`
- `ServiceError`
- `InternalError`
- `RateLimitError`

Each class enforces the correct HTTP status code. You can pass either a message or an options object.

---

## Usage Examples

### Throwing in a Controller

```ts
import { NotFoundError } from '@shared/utils/error/error.util';

@Get('/users/:id')
getUser(@Param('id') id: string) {
  const user = this.userService.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}
```

### Throwing in a Service

```ts
import { ConflictError } from '@shared/utils/error/error.util';

createUser(email: string) {
  if (this.emailExists(email)) {
    throw new ConflictError({
      message: 'Email already in use',
      details: [{ path: 'email', message: 'Duplicate email' }],
    });
  }
  // ...
}
```

### Throwing a Custom Status Error

```ts
import { AppError } from '@shared/utils/error/error.util';

throw new AppError({ status: 418, message: "I'm a teapot" });
```

---

## Validation Errors (Zod)

If you use Zod for validation, you do **not** need to manually wrap Zod errors. The global error middleware will automatically convert any `ZodError` into a `ValidationError` with a clean, user-friendly structure.

**Example:**

```ts
import { z } from 'zod';
import { ValidationError } from '@shared/utils/error/error.util';

const schema = z.object({ email: z.string().email() });

try {
  schema.parse({ email: 'not-an-email' });
} catch (err) {
  throw ValidationError.fromZodError(err);
  // Or just throw err; the middleware will handle it
}
```

---

## Best Practices

- Always throw `AppError` or its subclasses for predictable errors.
- Use a message string for simple cases, or an options object for advanced cases.
- Never leak sensitive information in error messages.
- Use the `details` property for validation or field-specific errors.
- Use the `logContext` property to add extra context for logs (not sent to the client).
- For unknown errors, let the middleware handle them (it will wrap them in an `InternalError`).

---

## Custom Errors

You can create your own custom error classes by extending `AppError`:

```ts
import { AppError, AppErrorOptions } from '@shared/utils/error/error.util';

export class PaymentRequiredError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 402, message: arg });
    } else {
      super({ status: 402, ...arg });
    }
  }
}
```

---

## Error Response Format

All errors returned to the client follow this structure:

```json
{
  "status": 404,
  "type": "notfound",
  "message": "User not found",
  "errorId": "...", // only for 500+ errors
  "details": [ ... ] // only for validation errors
}
```

---

For more details, see the implementation in `@shared/utils/error/error.util.ts`.
