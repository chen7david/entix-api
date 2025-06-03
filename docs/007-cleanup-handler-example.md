# Application Architecture Guide

This guide demonstrates the architecture of the application, focusing on service initialization and cleanup.

## Overview

The application follows these SOLID principles:

1. **Single Responsibility Principle**: Each service has a well-defined responsibility
2. **Open/Closed Principle**: Services can be extended without modification
3. **Liskov Substitution Principle**: Services implement interfaces that define their behavior
4. **Interface Segregation Principle**: Small, focused interfaces define service behaviors
5. **Dependency Inversion Principle**: High-level modules depend on abstractions

## Core Components

### ServerService

The `ServerService` provides a centralized way to manage the cleanup of resources when the application shuts down:

- Registers cleanup handlers
- Provides a `gracefulShutdown` method called by process signal handlers
- Executes all cleanup handlers in parallel when shutdown is triggered

### AppService

The `AppService` manages application initialization:

- Registers services that implement the `InitializableService` interface
- Initializes all registered services in sequence
- Reports application startup status

### Process Signal Handling

Process signal handlers are registered in `server.ts` to:

1. Listen for shutdown signals (SIGINT, SIGTERM, SIGUSR2)
2. Call the ServerService's gracefulShutdown method
3. Handle process exit based on success or failure

## Interfaces

### CleanupHandler

Services that need cleanup implement the `CleanupHandler` interface:

```typescript
export type CleanupHandler = {
  /**
   * Method to clean up resources
   */
  cleanup: () => Promise<void>;
};
```

### InitializableService

Services that need initialization implement the `InitializableService` interface:

```typescript
export interface InitializableService {
  /**
   * Initialize the service
   */
  initialize(): Promise<void>;
}
```

## Example Implementation

Here's how to implement both interfaces in a service:

```typescript
import { Injectable } from '@core/utils/di.util';
import { LoggerService } from '@core/services/logger.service';
import { ServerService } from '@core/services/server.service';
import { CleanupHandler } from '@core/types/app.types';
import { InitializableService } from '@core/services/app.service';
import { Container } from 'typedi';

@Injectable()
export class ExampleService implements CleanupHandler, InitializableService {
  private readonly logger: LoggerService;
  private resource: any = null;
  private isRegisteredForCleanup = false;

  constructor(private readonly loggerService: LoggerService) {
    this.logger = loggerService.setContext('ExampleService');
  }

  /**
   * Initialize the service
   * Implements InitializableService interface
   */
  async initialize(): Promise<void> {
    // Register for cleanup if not already done
    this.registerForCleanupIfNeeded();

    // Initialize resources
    this.resource = {
      /* some resource */
    };
    this.logger.info('Resource initialized');
  }

  /**
   * Implementation of the CleanupHandler interface
   * Releases any resources that need cleanup
   */
  async cleanup(): Promise<void> {
    if (this.resource) {
      this.logger.info('Cleaning up resources');
      // Release resources here
      this.resource = null;
      this.logger.info('Resources cleaned up successfully');
    }
  }

  /**
   * Register this service for cleanup
   * This breaks potential circular dependencies
   */
  private registerForCleanupIfNeeded(): void {
    if (!this.isRegisteredForCleanup) {
      try {
        const serverService = Container.get(ServerService);
        serverService.registerForCleanup(this);
        this.isRegisteredForCleanup = true;
        this.logger.debug('Registered for cleanup with ServerService');
      } catch (error) {
        this.logger.warn('Could not register for cleanup with ServerService', error);
      }
    }
  }
}
```

## Application Startup Flow

The application startup flow is:

1. `server.ts` bootstraps the application
2. Services are registered with `AppService` for initialization
3. `AppService.initialize()` is called to initialize all registered services
4. `ServerService.initialize()` is called to set up the server
5. Process signal handlers are registered to call `ServerService.gracefulShutdown()`

## Common Cleanup Use Cases

### Database Connections

```typescript
async cleanup(): Promise<void> {
  if (this.dbConnection) {
    this.logger.info('Closing database connection');
    await this.dbConnection.close();
    this.dbConnection = null;
    this.logger.info('Database connection closed');
  }
}
```

### Redis Connections

```typescript
async cleanup(): Promise<void> {
  if (this.redisClient) {
    this.logger.info('Disconnecting Redis client');
    await this.redisClient.quit();
    this.redisClient = null;
    this.logger.info('Redis client disconnected');
  }
}
```

### File Handles

```typescript
async cleanup(): Promise<void> {
  if (this.fileHandles.length > 0) {
    this.logger.info(`Closing ${this.fileHandles.length} file handles`);
    await Promise.all(this.fileHandles.map(handle => handle.close()));
    this.fileHandles = [];
    this.logger.info('All file handles closed');
  }
}
```

## Best Practices

1. Always check if resources exist before cleaning them up
2. Log the beginning and completion of cleanup operations
3. Handle exceptions and log errors that occur during cleanup
4. Use proper async/await patterns for asynchronous cleanup operations
5. Register for cleanup as early as possible, typically during initialization
6. Avoid circular dependencies between services
7. Use interfaces to define behavior contracts between services
