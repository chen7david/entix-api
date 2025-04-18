# AppService Documentation

The `AppService` is a core service that creates and configures an Express application with routing-controllers integration. This document provides information on how to use the AppService in your application.

[← Back to README](../README.md)

## Overview

`AppService` simplifies the process of setting up an Express application with proper middleware and routing configuration. It integrates with the routing-controllers library to provide a structured approach to building REST APIs.

## Installation

No additional installation is required as the service is part of the core codebase. However, ensure you have the required dependencies:

```
npm install express routing-controllers reflect-metadata
```

## Usage

### Basic Usage

```typescript
import { AppService } from '@src/services/app/app.service';
import path from 'path';

const appService = new AppService({
  routePrefix: '/api',
  controllers: [path.join(__dirname, 'domains', '**', '*.controller.{ts,js}')],

  beforeRoutes: (app) => {
    // Configure middleware that should run before the controllers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  },

  afterRoutes: (app) => {
    // Configure middleware that should run after the controllers
    app.use((req, res, next) => {
      res.status(404).json({ message: 'Not found' });
    });
  },
});

// Get the configured Express app
const app = appService.getApp();

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Advanced Usage

You can customize the AppService with additional options:

```typescript
import { AppService } from '@src/services/app/app.service';
import { authMiddleware } from '@src/middleware/auth.middleware';
import { errorMiddleware } from '@src/middleware/error.middleware';

const appService = new AppService({
  routePrefix: '/api/v1',
  controllers: [
    // Provide explicit controller classes
    UserController,
    ProductController,
  ],

  // Add custom middlewares
  middlewares: [authMiddleware, errorMiddleware],

  // Add an authorization checker
  authorizationChecker: async (action) => {
    const token = action.request.headers['authorization'];
    return verifyToken(token);
  },

  // Add a current user checker
  currentUserChecker: async (action) => {
    const token = action.request.headers['authorization'];
    return getUserFromToken(token);
  },

  beforeRoutes: (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());
  },

  afterRoutes: (app) => {
    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);
  },
});
```

## Configuration Options

The `AppService` constructor accepts an `AppServiceOptions` object with the following properties:

| Property               | Type                       | Required | Description                                             |
| ---------------------- | -------------------------- | -------- | ------------------------------------------------------- |
| `controllers`          | `string[]` or `Function[]` | Yes      | Array of controller classes or path to controller files |
| `routePrefix`          | `string`                   | No       | Prefix for all routes (e.g., '/api')                    |
| `middlewares`          | `string[]` or `Function[]` | No       | Array of middleware classes or path to middleware files |
| `authorizationChecker` | `Function`                 | No       | Function to check if a request is authorized            |
| `currentUserChecker`   | `Function`                 | No       | Function to get the current user from a request         |
| `beforeRoutes`         | `Function`                 | Yes      | Function to configure middleware before routes          |
| `afterRoutes`          | `Function`                 | Yes      | Function to configure middleware after routes           |

## Error Handling

The `AppService` includes basic error handling to ensure proper configuration:

- It will throw an error if `AppServiceOptions` is not provided
- It will throw an error if `beforeRoutes` is not a function
- It will throw an error if `afterRoutes` is not a function
- It will throw an error if no controllers are provided

## Best Practices

1. **Modular Controllers**: Organize your controllers by domain for better code organization.
2. **Middleware Order**: Be mindful of the order in which you apply middleware.
3. **Error Handling**: Always include proper error handling middleware in `afterRoutes`.
4. **Security**: Include security-related middleware (like helmet, rate limiting) in `beforeRoutes`.

## Examples

### Example 1: Basic API Server

```typescript
// app.ts
import 'reflect-metadata';
import express from 'express';
import { AppService } from '@src/services/app/app.service';
import path from 'path';

export const appService = new AppService({
  routePrefix: '/api',
  controllers: [path.join(__dirname, 'domains', '**', '*.controller.{ts,js}')],

  beforeRoutes: (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  },

  afterRoutes: (app) => {
    app.use((req, res) => {
      res.status(404).json({ message: 'Not found' });
    });
  },
});

// server.ts
import { appService } from './app';

const PORT = process.env.PORT || 3000;
const app = appService.getApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Example 2: API with Authentication

```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// app.ts
import 'reflect-metadata';
import express from 'express';
import { AppService } from '@src/services/app/app.service';
import { authMiddleware } from './middleware/auth.middleware';

export const appService = new AppService({
  routePrefix: '/api',
  controllers: [__dirname + '/controllers/*.js'],
  middlewares: [authMiddleware],

  authorizationChecker: async (action) => {
    return !!action.request.user;
  },

  currentUserChecker: async (action) => {
    return action.request.user;
  },

  beforeRoutes: (app) => {
    app.use(express.json());
  },

  afterRoutes: (app) => {
    app.use((err, req, res, next) => {
      res.status(500).json({ message: 'Internal server error' });
    });
  },
});
```

## Related Documentation

- [Server Service](./server-service.md)
- [Environment Loader](./setup-env-loader.md)
- [TypeScript Setup](./setup-typescript.md)
- [Path Aliases](./setup-path-aliases.md)
- [Testing Setup](./setup-jest.md)
