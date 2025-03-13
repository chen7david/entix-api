---
title: Response Format
---

# Response Format

This document describes the standard response format used by all Entix API endpoints.

## Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data goes here
  }
}
```

For collection endpoints (lists of resources), the data field will include pagination information:

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of resources
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "A human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      // Optional additional error details
    }
  }
}
```

For validation errors, the details field will contain information about the validation failures:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "username": ["Username must be at least 3 characters"],
      "email": ["Invalid email format"]
    }
  }
}
```

## HTTP Status Codes

Entix API uses standard HTTP status codes:

| Status Code               | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| 200 OK                    | The request was successful                             |
| 201 Created               | A new resource was created successfully                |
| 204 No Content            | The request was successful but no content was returned |
| 400 Bad Request           | The request was invalid or malformed                   |
| 401 Unauthorized          | Authentication is required or credentials are invalid  |
| 403 Forbidden             | The authenticated user doesn't have permission         |
| 404 Not Found             | The requested resource doesn't exist                   |
| 422 Unprocessable Entity  | Validation errors                                      |
| 500 Internal Server Error | An unexpected error occurred on the server             |

## Examples

### Successful Get User Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Failed Authentication Response

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "username": ["Username must be at least 3 characters"],
      "email": ["Invalid email format"]
    }
  }
}
```
