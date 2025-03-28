# Not Found Middleware

This document explains the Not Found middleware in the Entix API application and why it uses a traditional Express middleware pattern rather than routing-controllers.

## Overview

The Not Found middleware handles all requests that don't match any defined routes in the application, responding with a standardized 404 error response.

## Why Traditional Express Middleware?

Unlike the other middleware in our application that uses routing-controllers, the Not Found middleware is implemented as a traditional Express middleware. This design choice was made for several important reasons:

1. **Catch-all behavior**: The middleware needs to catch all unhandled routes, including those outside the API prefix (e.g., `/api`). Routing-controllers middlewares only apply to routes that are handled by the routing-controllers framework.

2. **Execution order**: The Not Found middleware must be registered after all other routes and middleware to properly function as a "catch-all" for unhandled routes. Using a traditional Express middleware allows precise control over when it executes in the middleware chain.

3. **Route prefix independence**: Traditional middleware works across all routes regardless of the `/api` prefix, ensuring that requests to non-existent routes like `/some-unknown-route` also receive proper 404 responses.

## How It Works

The Not Found middleware checks if a response has already been sent before handling the request. If no previous middleware or route has sent a response, it returns a standardized 404 response in JSON format.

```json
{
  "status": 404,
  "message": "Not found",
  "path": "/the/requested/path",
  "timestamp": "2023-03-28T12:34:56.789Z"
}
```

## Registration in the Application

The middleware is registered in the Express application after all other routes and the routing-controllers setup:

```typescript
// In app.ts
export class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupControllers();

    // Register the not found middleware last to catch all unhandled routes
    this.app.use(notFoundMiddleware);
  }

  // ...
}
```

## Implementation Details

The middleware:

1. Checks if headers have already been sent using `response.headersSent`
2. If headers have been sent, it calls `next()` to pass control to the next middleware
3. If headers have not been sent, it responds with a 404 status and a structured JSON response
4. Logs the unhandled route for debugging purposes

## Advantages

- **Consistent error responses**: All unhandled routes generate the same JSON error format
- **Complete coverage**: Catches requests both inside and outside the API prefix
- **Debug information**: Includes the requested path and timestamp for troubleshooting
- **Simple and effective**: Follows the Express middleware pattern for "catch-all" error handling

## When to Use This Pattern

Use the traditional Express middleware pattern (instead of routing-controllers) when:

1. You need to handle requests outside the routing-controllers managed routes
2. You need to process all requests regardless of route prefixes
3. You need middleware that must run at a specific position in the middleware chain
4. You need to catch all unhandled routes (like this Not Found middleware)

## Example Usage

In most cases, you won't interact directly with this middleware as it's meant to be a fallback for unhandled routes. However, if you need to customize the 404 response, you can modify the middleware:

```typescript
export const customNotFoundMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  if (!response.headersSent) {
    response.status(404).json({
      status: 404,
      message: 'Custom not found message',
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      // Add any other properties you want to include
    });
  } else {
    next();
  }
};

// Then in app.ts
this.app.use(customNotFoundMiddleware);
```
