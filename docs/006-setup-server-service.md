# Server Service and Application Architecture

This document explains the architecture and functionality of the ServerService and AppService, which are responsible for application initialization and cleanup.

## Overview

The application follows a modular, service-based architecture that adheres to the SOLID principles:

- **Single Responsibility Principle**: Each service has a clear, focused responsibility
- **Open/Closed Principle**: Services can be extended without modification
- **Liskov Substitution Principle**: Interfaces define behaviors that can be substituted
- **Interface Segregation Principle**: Small, focused interfaces define service contracts
- **Dependency Inversion Principle**: High-level modules depend on abstractions

## Core Components

### ServerService

The `ServerService` is responsible for:

1. Initializing the server environment
2. Managing the registration of cleanable resources
3. Orchestrating graceful shutdown of the application

Key features:

- Registers services that implement the `CleanupHandler` interface
- Provides a `gracefulShutdown` method to handle termination signals
- Executes cleanup handlers in parallel when shutting down

```typescript
// Example usage
serverService.registerForCleanup(dbService);
await serverService.gracefulShutdown('SIGTERM');
```

### AppService

The `AppService` is responsible for:

1. Initializing the application and its dependencies
2. Managing application-level resources
3. Providing a cleanup mechanism for application resources

```typescript
// Example usage
await appService.initialize();
```

## Interfaces

The architecture uses the following interfaces to define service contracts:

### CleanupHandler

```typescript
export type CleanupHandler = {
  /**
   * Method to clean up resources
   */
  cleanup: () => Promise<void>;
};
```

Services that implement this interface can register with the `ServerService` for cleanup during shutdown.

## Application Lifecycle

1. **Startup**:

   - The application bootstraps by creating service instances
   - `ServerService.initialize()` is called to set up the server
   - `AppService.initialize()` is called to initialize the application

2. **Runtime**:

   - Services handle requests and manage resources
   - New services can register for cleanup as needed

3. **Shutdown**:
   - Process signals (SIGINT, SIGTERM, SIGUSR2) are caught
   - `ServerService.gracefulShutdown()` is called
   - All registered cleanup handlers are executed in parallel
   - The process terminates after cleanup completes

## Best Practices

When working with these services, follow these best practices:

1. **Resource Management**:

   - Services should clean up their own resources
   - Register with `ServerService` for cleanup during application shutdown
   - Always implement cleanup logic in an idempotent way

2. **Error Handling**:

   - Handle initialization and cleanup errors properly
   - Log errors during cleanup but don't prevent other services from cleaning up
   - Ensure graceful shutdown even in error conditions

3. **Testing**:
   - Test both initialization and cleanup paths
   - Mock dependencies to isolate service behavior
   - Verify cleanup is called during shutdown

## Example Implementation

Here's an example of a service that implements the `CleanupHandler` interface:

```typescript
@Injectable()
export class DatabaseService implements CleanupHandler {
  private connection: Connection | null = null;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly serverService: ServerService,
  ) {
    this.logger = loggerService.setContext('DatabaseService');
    this.serverService.registerForCleanup(this);
  }

  async connect(): Promise<void> {
    this.connection = await createDatabaseConnection();
    this.logger.info('Database connected');
  }

  async cleanup(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.logger.info('Database connection closed');
    }
  }
}
```

## Architecture Diagram

```
┌─────────────────┐     ┌───────────────┐     ┌───────────────┐
│                 │     │               │     │               │
│  ServerService  │◄────┤  AppService   │◄────┤  DbService    │
│                 │     │               │     │               │
└────────┬────────┘     └───────────────┘     └───────────────┘
         │                      ▲                     ▲
         │                      │                     │
         │                      │                     │
         │                      │                     │
         ▼                      │                     │
┌─────────────────┐             │                     │
│                 │             │                     │
│  CleanupHandler │◄────────────┴─────────────────────┘
│   Interface     │
│                 │
└─────────────────┘
```

This architecture ensures that:

1. Services have clear responsibilities
2. Resources are properly cleaned up during shutdown
3. The application can gracefully handle termination signals
4. Services are loosely coupled through interfaces
