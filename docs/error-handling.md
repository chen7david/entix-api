# Error Handling System

This document explains the error handling system used in the Entix API application.

## Overview

The error handling system is designed to:

1. Provide consistent error responses to clients
2. Mask sensitive information in server errors
3. Include error IDs for tracking and debugging
4. Properly handle and format validation errors
5. Log all errors with relevant context for troubleshooting

## Error Types

The system provides several specialized error types that extend the base `AppError` class:

| Error Type          | Status Code | Purpose                      |
| ------------------- | ----------- | ---------------------------- |
| `BadRequestError`   | 400         | Invalid or malformed request |
| `UnauthorizedError` | 401         | Authentication required      |
| `ForbiddenError`    | 403         | Permission denied            |
| `NotFoundError`     | 404         | Resource not found           |
| `ConflictError`     | 409         | Resource conflict            |
| `ValidationError`   | 422         | Validation failed            |
| `ServiceError`      | 503         | Service unavailable          |
| `InternalError`     | 500         | Internal server error        |

## Creating and Throwing Errors

You can create and throw errors from anywhere in your application:

```typescript
import { NotFoundError } from '@src/utils/error.util';

function getUserById(id: string) {
  const user = userRepository.findById(id);
  if (!user) {
    throw new NotFoundError({
      message: `User with ID ${id} not found`,
      logContext: { userId: id },
    });
  }
  return user;
}
```

### Error Options

When creating errors, you can specify various options:

```typescript
const error = new BadRequestError({
  // Custom error message (defaults to standard message for error type)
  message: 'Invalid user data',

  // Original error that caused this error
  cause: originalError,

  // Additional context for logging (not exposed to client)
  logContext: {
    userId: '123',
    additionalInfo: 'Useful for debugging',
  },

  // Validation details for field-level errors
  details: [
    { path: 'email', message: 'Must be a valid email address' },
    { path: 'password', message: 'Must be at least 8 characters long' },
  ],

  // Control whether error details are exposed to client
  // Default: true for 4xx errors, false for 5xx errors
  expose: false,
});
```

## Zod Validation Errors

The system seamlessly integrates with Zod for validation:

```typescript
import { z } from 'zod';
import { createAppError } from '@src/utils/error.util';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

try {
  const userData = userSchema.parse(request.body);
  // Use validated data
} catch (error) {
  // Automatically converts to ValidationError with formatted details
  throw createAppError(error);
}
```

Or you can use the static helper method directly:

```typescript
try {
  const userData = userSchema.parse(request.body);
  // Use validated data
} catch (error) {
  if (error instanceof ZodError) {
    throw AppError.fromZodError(error, 'Invalid user data');
  }
  throw error;
}
```

## Error Responses

The error middleware automatically formats error responses sent to clients:

```json
{
  "status": 400,
  "type": "badrequest",
  "message": "Invalid user data",
  "details": [
    {
      "path": "email",
      "message": "Must be a valid email address",
      "code": "invalid_string"
    },
    {
      "path": "password",
      "message": "Must be at least 8 characters long",
      "code": "too_small"
    }
  ]
}
```

For server errors (5xx), sensitive details are masked and an error ID is included:

```json
{
  "status": 500,
  "type": "internal",
  "message": "Internal Server Error",
  "errorId": "550e8400-e29b-41d4-a716-446655440000"
}
```

This error ID is logged along with the full error details, making it easy to find the relevant log entry when a client reports an issue.

## Error Handling Middleware

The application uses the `ErrorHandlerMiddleware` to automatically catch and process all errors. It's registered in the application setup:

```typescript
useExpressServer(app, {
  controllers: [...],
  middlewares: [ErrorHandlerMiddleware],
  defaultErrorHandler: false,
  // other options...
});
```

This middleware:

1. Converts any error to an `AppError`
2. Logs the error with appropriate context
3. Formats and sends the standardized error response

## Best Practices

1. **Use specific error types** - Choose the most appropriate error type for the situation
2. **Provide meaningful messages** - Error messages should be clear and actionable
3. **Include context for logging** - Add relevant data in `logContext` to aid debugging
4. **Don't expose sensitive information** - Use `expose: false` for errors containing sensitive data
5. **Use error IDs for tracking** - When users report errors, ask for the error ID

## Example Usage in Controllers

```typescript
import { JsonController, Get, Param, Body, Post } from 'routing-controllers';
import { ZodError, z } from 'zod';
import { NotFoundError, ValidationError, createAppError } from '@src/utils/error.util';

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

@JsonController('/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = userService.findById(id);
    if (!user) {
      throw new NotFoundError({
        message: `User with ID ${id} not found`,
      });
    }
    return user;
  }

  @Post()
  createUser(@Body() body: unknown) {
    try {
      const userData = userSchema.parse(body);
      return userService.create(userData);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error, 'Invalid user data');
      }
      throw error;
    }
  }
}
```

## Error Handling in Services

When handling errors in service layers, you can use the `createAppError` utility to convert any error to an appropriate `AppError`:

```typescript
import { createAppError, ServiceError } from '@src/utils/error.util';

async function fetchData() {
  try {
    const response = await externalApiClient.getData();
    return response.data;
  } catch (error) {
    // If it's a known API error, create a specific error
    if (error.response?.status === 503) {
      throw new ServiceError({
        message: 'External API is currently unavailable',
        cause: error,
        logContext: {
          apiResponse: error.response?.data,
          statusCode: error.response?.status,
        },
      });
    }

    // Otherwise, let the error handler convert it
    throw createAppError(error);
  }
}
```

## Testing with Errors

The error system is designed to be easy to test. Here's an example of testing error handling:

```typescript
import { NotFoundError } from '@src/utils/error.util';

describe('UserService', () => {
  it('should throw NotFoundError when user does not exist', async () => {
    // Mock repository to return null
    userRepositoryMock.findById.mockResolvedValue(null);

    // Expect the function to throw a NotFoundError
    await expect(userService.getUserById('123')).rejects.toThrow(NotFoundError);

    // Can also check specific properties of the error
    try {
      await userService.getUserById('123');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.status).toBe(404);
      expect(error.message).toMatch(/User with ID 123 not found/);
    }
  });
});
```
