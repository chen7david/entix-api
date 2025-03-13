---
title: Error Codes
---

# Error Codes

This document provides a comprehensive list of error codes that may be returned by the Entix API.

## Error Structure

All error responses include an error code that uniquely identifies the type of error:

```json
{
  "success": false,
  "error": {
    "message": "A human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

## Standard Error Codes

### Authentication Errors

| Code                  | HTTP Status | Description                                         |
| --------------------- | ----------- | --------------------------------------------------- |
| `UNAUTHORIZED`        | 401         | User is not authenticated                           |
| `INVALID_CREDENTIALS` | 401         | Provided credentials are invalid                    |
| `INVALID_TOKEN`       | 401         | Authentication token is invalid or expired          |
| `FORBIDDEN`           | 403         | User doesn't have permission to access the resource |

### Validation Errors

| Code                     | HTTP Status | Description                                   |
| ------------------------ | ----------- | --------------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Request failed validation                     |
| `INVALID_REQUEST_BODY`   | 400         | Request body is malformed or cannot be parsed |
| `MISSING_REQUIRED_FIELD` | 400         | A required field is missing                   |
| `INVALID_FIELD_VALUE`    | 400         | A field value is invalid                      |

### Resource Errors

| Code                      | HTTP Status | Description                                                  |
| ------------------------- | ----------- | ------------------------------------------------------------ |
| `RESOURCE_NOT_FOUND`      | 404         | The requested resource does not exist                        |
| `RESOURCE_ALREADY_EXISTS` | 409         | Attempt to create a resource that already exists             |
| `RESOURCE_CONFLICT`       | 409         | The request conflicts with the current state of the resource |

### Database Errors

| Code                | HTTP Status | Description                                           |
| ------------------- | ----------- | ----------------------------------------------------- |
| `DATABASE_ERROR`    | 500         | An error occurred while interacting with the database |
| `CONNECTION_ERROR`  | 500         | Failed to connect to the database                     |
| `TRANSACTION_ERROR` | 500         | An error occurred during a database transaction       |

### Server Errors

| Code                    | HTTP Status | Description                                |
| ----------------------- | ----------- | ------------------------------------------ |
| `INTERNAL_SERVER_ERROR` | 500         | An unexpected error occurred on the server |
| `SERVICE_UNAVAILABLE`   | 503         | The service is temporarily unavailable     |
| `TIMEOUT_ERROR`         | 504         | The operation timed out                    |

## Feature-Specific Error Codes

### User Errors

| Code                  | HTTP Status | Description                                           |
| --------------------- | ----------- | ----------------------------------------------------- |
| `USER_NOT_FOUND`      | 404         | The specified user does not exist                     |
| `USER_ALREADY_EXISTS` | 409         | A user with the same username or email already exists |
| `INVALID_PASSWORD`    | 400         | The provided password does not meet requirements      |

## How to Handle Errors

When receiving an error response, clients should:

1. Check the HTTP status code for a general category of the error
2. Use the error code to handle specific error cases
3. Display the error message to the user when appropriate

Example handling in client code:

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();

    if (!data.success) {
      // Handle specific error cases
      switch (data.error.code) {
        case 'USER_NOT_FOUND':
          console.error(`User ${id} not found`);
          break;
        case 'UNAUTHORIZED':
          // Redirect to login
          break;
        default:
          console.error(`Error: ${data.error.message}`);
      }
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```
