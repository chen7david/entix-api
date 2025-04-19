# Server Service

The `ServerService` is a robust wrapper around Express and Node's HTTP server that provides lifecycle management and event handling capabilities. While it can be used with any Express application, it's designed to work seamlessly with our `AppService` for complete application lifecycle management.

## Features

- Express application server management
- Graceful shutdown handling with state tracking
- Error handling with propagation to custom handlers
- Server status notifications
- IP address detection
- Configurable port binding
- Protection against race conditions and duplicate shutdowns

## Installation

The `ServerService` is part of the core application services. No additional installation is required if you're using the main application.

## Usage

### Basic Usage

```typescript
import express from 'express';
import { ServerService } from '@src/services/server/server.service';

const app = express();
app.get('/', (req, res) => res.send('Hello World!'));

const serverService = new ServerService({
  app,
  port: 3000,
  onListening: ({ port, ip }) =>
    console.log(`Server running at http://${ip}:${port}`),
});

await serverService.start();

// When CTRL+C is pressed:
// - The beforeShutdown handler runs (if provided)
// - The server stops gracefully
// - The process exits cleanly
```

### With AppService Integration

```typescript
import { AppService } from '@src/services/app/app.service';
import { ServerService } from '@src/services/server/server.service';

const appService = new AppService();
const app = appService.getApp();

const serverService = new ServerService({
  app,
  port: 3000,
  beforeShutdown: async () => {
    // Will be called during graceful shutdown (CTRL+C)
    // Perform any necessary cleanup here
    console.log('Running cleanup tasks...');
  },
  onError: (error) => {
    console.error('Server error:', error);
  },
  onListening: ({ port, ip }) => {
    console.log(`Server running at http://${ip}:${port}`);
  },
});

await serverService.start();
```

## API Reference

### Constructor Options

The `ServerService` constructor accepts an options object with the following properties:

| Property         | Type                                                   | Required | Description                                    |
| ---------------- | ------------------------------------------------------ | -------- | ---------------------------------------------- |
| `app`            | `express.Application`                                  | Yes      | The Express application instance to serve      |
| `port`           | `number`                                               | Yes      | The port number to listen on                   |
| `beforeShutdown` | `() => void \| Promise<void>`                          | No       | Handler called before server shutdown          |
| `onError`        | `(error: Error) => void \| Promise<void>`              | No       | Handler called when server encounters an error |
| `onListening`    | `(info: ServerListeningInfo) => void \| Promise<void>` | No       | Handler called when server starts listening    |

### Methods

#### `start(): Promise<void>`

Starts the HTTP server on the configured port.

```typescript
await serverService.start();
```

- Throws an error if the server is already running
- Sets internal state to track that the server is running
- Resolves when the server starts listening
- Rejects if there's an error during startup (like EADDRINUSE)

#### `stop(): Promise<void>`

Gracefully stops the HTTP server.

```typescript
await serverService.stop();
```

- No-op if the server is not running
- Updates internal state tracking
- Resolves when the server has completely stopped

#### `getServerIp(): string`

Gets the server's IP address.

```typescript
const ip = serverService.getServerIp();
console.log(`Server IP: ${ip}`);
```

- Returns the first non-internal IPv4 address
- Falls back to 'localhost' if no suitable IP is found

## Internal State Tracking

The `ServerService` maintains internal state to ensure reliability:

- `isRunning`: Tracks whether the server is currently listening
- `isShuttingDown`: Prevents multiple simultaneous shutdown attempts

These state flags ensure:

- The server cannot be started twice
- The shutdown sequence runs only once, even if triggered multiple times
- Resources are properly cleaned up during shutdown

## Event Handling

The `ServerService` handles several important events:

- **SIGTERM/SIGINT** (once): Triggers graceful shutdown, handling Ctrl+C
- **error**: Server error events, passed to your onError handler
- **listening**: Server start events, passed to your onListening handler

## Graceful Shutdown Process

When SIGTERM or SIGINT (Ctrl+C) is received:

1. Prevents duplicate shutdown attempts via `isShuttingDown` flag
2. Executes `beforeShutdown` handler if provided
3. Stops the HTTP server if it's running
4. Catches and handles any errors during shutdown
5. Exits the process with appropriate code (0 for success, 1 for error)

## Best Practices

1. Always implement error handling:

```typescript
new ServerService({
  app,
  port: 3000,
  onError: (error) => {
    logger.error('Server error:', error);
    // Handle error appropriately
  },
});
```

2. Implement graceful shutdown:

```typescript
new ServerService({
  app,
  port: 3000,
  beforeShutdown: async () => {
    // Close database connections
    // Clean up resources
    // etc.
  },
});
```

3. Log server status:

```typescript
new ServerService({
  app,
  port: 3000,
  onListening: ({ port, ip }) => {
    logger.info(`Server running at http://${ip}:${port}`);
  },
});
```

## Integration with AppService

While `ServerService` can be used standalone, it's designed to work with `AppService` for complete application lifecycle management. When used together:

1. `AppService` manages the Express application configuration and middleware
2. `ServerService` manages the HTTP server lifecycle
3. Both services coordinate during shutdown for proper cleanup

See the [AppService documentation](./app-service.md) for more details on the integration.

## Related Documentation

- [AppService](./app-service.md) - Express application setup with routing-controllers
- [Environment Loader](./setup-env-loader.md)
- [TypeScript Setup](./setup-typescript.md)
- [Path Aliases](./setup-path-aliases.md)
- [Testing Setup](./setup-jest.md)
- [Deployment Guide](./deployment.md) - Production deployment instructions
