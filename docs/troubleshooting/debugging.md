---
title: Debugging
---

# Debugging Guide

This guide provides techniques and strategies for debugging issues in the Entix API.

## Debugging Tools

### Built-in Node.js Debugger

Node.js comes with a built-in debugger that allows you to pause execution and inspect your code.

#### Using the inspector protocol with Chrome DevTools

1. Start your application with the `--inspect` flag:

```bash
node --inspect dist/server.js
```

2. Open Chrome and navigate to `chrome://inspect`
3. Click on "Open dedicated DevTools for Node"
4. Use breakpoints and the DevTools console to debug your application

#### Adding `debugger` statements

You can add `debugger` statements to your code to pause execution at specific points:

```typescript
function processData(data) {
  debugger; // Execution will pause here when running with --inspect
  // Rest of your code
}
```

### VS Code Debugging

Visual Studio Code provides excellent debugging capabilities for TypeScript applications.

1. Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/server.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasenameNoExtension}", "--config", "jest.config.ts"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

2. Add breakpoints by clicking in the gutter next to line numbers
3. Start debugging by pressing F5 or clicking the debug icon

## Logging Techniques

### Enhanced Logging

Use the LoggerService to add detailed logging to your code:

```typescript
import { LoggerService } from '../services/logger.service';

const logger = new LoggerService();

// Log with context
logger.info('Processing request', {
  userId: req.user.id,
  endpoint: req.path,
  method: req.method,
});

// Log errors with stack traces
try {
  // Your code
} catch (error) {
  logger.error('Failed to process request', error as Error, {
    userId: req.user.id,
    endpoint: req.path,
  });
}
```

### Temporary Debug Logging

For quick debugging, you can use temporary console logs:

```typescript
console.log('DEBUG:', variable);
```

Remember to remove these before committing your code. Alternatively, use a DEBUG environment variable to control debug output:

```typescript
if (process.env.DEBUG) {
  console.log('DEBUG:', variable);
}
```

### HTTP Request Logging

For debugging API requests, you can use middleware to log requests and responses:

```typescript
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

const logger = new LoggerService();

export function requestDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });

  const originalSend = res.send;
  res.send = function (body) {
    logger.debug('Outgoing response', {
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime,
      body: typeof body === 'string' ? body : '(non-string body)',
    });
    return originalSend.call(this, body);
  };

  next();
}
```

## Database Debugging

### Query Logging

Enable query logging to see all SQL queries being executed:

```typescript
// In db.config.ts
import { Pool } from 'pg';
import { LoggerService } from '../services/logger.service';

const logger = new LoggerService();
const pool = new Pool({
  // Database connection parameters
  ...
});

// Log all queries
const originalQuery = pool.query;
pool.query = function(...args) {
  logger.debug('Executing SQL query', {
    text: args[0].text || args[0],
    values: args[0].values || args[1]
  });
  return originalQuery.apply(this, args);
};

export default pool;
```

### Database Transactions Debugging

For debugging complex database transactions:

```typescript
async function debugTransaction() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.debug('Transaction started');

    // Your transaction queries here
    const result1 = await client.query('...', [...]);
    logger.debug('Query 1 completed', { rows: result1.rows.length });

    const result2 = await client.query('...', [...]);
    logger.debug('Query 2 completed', { rows: result2.rows.length });

    await client.query('COMMIT');
    logger.debug('Transaction committed');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', error as Error);
    throw error;
  } finally {
    client.release();
    logger.debug('Client released');
  }
}
```

## Testing and Debugging

### Focused Testing

Run specific tests to isolate issues:

```bash
# Run a specific test file
npm test -- path/to/file.test.ts

# Run tests matching a pattern
npm test -- -t "should handle authentication"
```

### Jest Debugging

Use Jest's debugging features:

```typescript
// Log test objects with better formatting
console.log(JSON.stringify(complexObject, null, 2));

// Run a single test with .only
describe('MyComponent', () => {
  it.only('should do something specific', () => {
    // Only this test will run
  });
});
```

## Performance Debugging

### Memory Leaks

Use the Node.js built-in heap snapshot functionality to identify memory leaks:

1. Start your application with:

```bash
node --inspect dist/server.js
```

2. Connect with Chrome DevTools
3. Go to the Memory tab
4. Take multiple heap snapshots at different points
5. Compare snapshots to identify growing objects

### CPU Profiling

Identify performance bottlenecks with CPU profiling:

1. Start your application with:

```bash
node --inspect dist/server.js
```

2. Connect with Chrome DevTools
3. Go to the Profiler tab
4. Start recording CPU profile
5. Perform the slow operation
6. Stop recording and analyze the results

## Debugging Production Issues

### Source Maps

Generate source maps to make production debugging easier:

```json
// In tsconfig.json
{
  "compilerOptions": {
    // ... other options
    "sourceMap": true
  }
}
```

### Error Monitoring

Consider integrating an error monitoring service like Sentry:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});

// Capture errors
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## Common Debugging Scenarios

### Debugging Authentication Issues

Check token validation and user lookup:

```typescript
// Add temporary debug code
const token = extractToken(req);
logger.debug('Token extraction', {
  authHeader: req.headers.authorization,
  token: token ? `${token.substring(0, 10)}...` : null,
});

try {
  const decoded = jwt.verify(token, SECRET_KEY);
  logger.debug('Token verification', { decoded });

  const user = await userService.findById(decoded.sub);
  logger.debug('User lookup', {
    userId: decoded.sub,
    userFound: !!user,
  });
} catch (error) {
  logger.error('Auth failed', error as Error);
}
```

### Debugging Database Connection Issues

For database connection problems:

```typescript
// Test database connectivity
async function testDbConnection() {
  let client;
  try {
    logger.debug('Attempting to connect to database');
    client = await pool.connect();
    logger.debug('Successfully connected to database');

    const result = await client.query('SELECT NOW()');
    logger.debug('Query executed successfully', {
      result: result.rows[0],
    });

    return true;
  } catch (error) {
    logger.error('Database connection failed', error as Error);
    return false;
  } finally {
    if (client) {
      client.release();
      logger.debug('Database client released');
    }
  }
}
```

## Advanced Debugging Techniques

### Middleware Debugging

Debug Express middleware execution order:

```typescript
function debugMiddleware(name) {
  return (req, res, next) => {
    console.log(`Entering middleware: ${name}`);
    const start = Date.now();

    // Store the original end method
    const originalEnd = res.end;
    res.end = function () {
      console.log(`Exiting middleware: ${name} after ${Date.now() - start}ms`);
      return originalEnd.apply(this, arguments);
    };

    next();
  };
}

// Use it in your app
app.use(debugMiddleware('requestLogger'));
app.use(requestLogger);
app.use(debugMiddleware('errorMiddleware'));
app.use(errorMiddleware);
```

### Dependency Injection Debugging

Debug TypeDI container:

```typescript
import { Container } from 'typedi';

// See what services are registered
console.log('Available services:', Container.list());

// Get a service and inspect it
const service = Container.get('serviceName');
console.log('Service instance:', service);
```

## Debugging Tips

1. **Isolate the Problem**: Narrow down where the issue is occurring
2. **Use Breakpoints**: Set breakpoints at strategic points in your code
3. **Check Environment**: Verify environment variables and configurations
4. **Rubber Duck Debugging**: Explain the problem out loud to clarify your thinking
5. **Review Recent Changes**: Issues often appear after recent code changes
6. **Check Logs**: Look for error patterns in logs
7. **Simplify the Problem**: Remove code until the issue disappears, then add back piece by piece
8. **Take Breaks**: Fresh eyes often see solutions more easily
