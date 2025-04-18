# Error Handling

This document explains the error handling system in EntixAPI, how errors are defined, thrown, caught, and formatted for API responses.

## Overview

EntixAPI implements a robust error handling system with the following key components:

1. **Error Classes**: A hierarchy of error types for different scenarios
2. **Error Middleware**: Centralized error handling for consistent responses
3. **Error Utilities**: Helper functions for creating and manipulating errors

## Error Classes

Located in `src/shared/utils/errors/error.util.ts`, the error classes provide a structured way to represent different types of errors in the application.

### Base Class: AppError

`AppError` is the base class for all application errors. It extends the native JavaScript `Error` class and adds the following features:

- HTTP status code
- Unique error ID (UUID)
- Original error cause
- Detailed error information
- Logging context
- Exposure control (what gets sent to clients)
- Error type identifier

```typescript
const error = new AppError({
  status: 400,
  message: 'Invalid input',
  details: [{ path: 'email', message: 'Invalid email format' }],
  expose: true,
});
```

### Specialized Error Classes

The system provides several specialized error classes, each corresponding to a specific HTTP status code:

| Error Class         | Status Code | Default Message         | Use Case                                   |
| ------------------- | ----------- | ----------------------- | ------------------------------------------ |
| `BadRequestError`   | 400         | Bad request             | Invalid request format or parameters       |
| `UnauthorizedError` | 401         | Authentication required | Missing or invalid authentication          |
| `ForbiddenError`    | 403         | Access denied           | Authenticated but insufficient permissions |
| `NotFoundError`     | 404         | Resource not found      | Requested resource doesn't exist           |
| `ConflictError`     | 409         | Resource conflict       | Resource already exists or conflicts       |
| `ValidationError`   | 422         | Validation failed       | Input validation failed                    |
| `RateLimitError`    | 429         | Too many requests       | Rate limit exceeded                        |
| `InternalError`     | 500         | Internal server error   | Unexpected server-side errors              |
| `ServiceError`      | 503         | Service unavailable     | External service failure                   |

### Usage Example

```typescript
// In a controller or service
if (!user) {
  throw new NotFoundError({
    message: `User with ID ${id} not found`,
    details: [{ path: 'id', message: 'User does not exist' }],
  });
}
```

## Error Middleware

Located in `src/middleware/error.middleware.ts`, the `ErrorHandlerMiddleware` catches all errors thrown within the application and processes them into consistent responses.

### Key Features

1. **Error Normalization**: Converts all error types to `AppError` instances
2. **Error Logging**: Logs errors with appropriate context and severity
3. **Response Formatting**: Standardizes error responses to clients
4. **Security**: Masks sensitive error details in production

### Response Format

All error responses follow this structure:

```json
{
  "status": 400,
  "type": "validation",
  "message": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Must be a valid email address"
    }
  ],
  "errorId": "uuidv4-identifier" // Only for 5xx errors
}
```

For server errors (5xx), sensitive details are masked, and only a generic message is exposed alongside an error ID for troubleshooting.

## Error Utilities

The system includes utility functions to help with error handling:

### createAppError

Converts any error into an appropriate `AppError`:

```typescript
try {
  // Some operation
} catch (error) {
  throw createAppError(error);
}
```

### AppError.fromZodError

Specifically converts Zod validation errors into a properly formatted `ValidationError`:

```typescript
try {
  schema.parse(data);
} catch (error) {
  throw AppError.fromZodError(error);
}
```

## Best Practices

1. **Use Specific Error Classes**: Instead of the generic `AppError`, use the most specific error class for your scenario.

2. **Include Meaningful Details**: Add detailed information to help clients understand and fix the error.

3. **Control Exposure**: Use the `expose` flag to control what information is sent to clients.

4. **Include Context**: Add relevant information to the `logContext` for better error tracking.

5. **Avoid Try/Catch Everywhere**: Let the middleware handle errors, don't catch them unless you need to transform them.

## Integration with Frontend

Frontend applications should handle error responses based on:

1. HTTP status code
2. Error type
3. Error details (for validation errors)

For server errors (5xx), display the error ID to users so they can reference it when reporting issues.
