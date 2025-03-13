---
title: Logging
---

# Logging

This guide explains how logging is implemented in Entix API using Pino.

## Overview

Entix API uses [Pino](https://github.com/pinojs/pino) for high-performance logging with a small footprint. The logging system is configured to provide detailed information in development and more concise logs in production.

## Logger Service

Logging is centralized through the `LoggerService` in `src/services/logger.service.ts`:

```typescript
import { Service } from 'typedi';
import pino from 'pino';
import { getEnv } from '../utils/config.util';

@Service()
export class LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: getEnv('LOG_LEVEL', 'info'),
      transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
    });
  }

  info(message: string, data?: object) {
    this.logger.info(data || {}, message);
  }

  error(message: string, error?: Error, data?: object) {
    this.logger.error(
      {
        ...data,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      },
      message,
    );
  }

  warn(message: string, data?: object) {
    this.logger.warn(data || {}, message);
  }

  debug(message: string, data?: object) {
    this.logger.debug(data || {}, message);
  }
}
```

## HTTP Request Logging

HTTP requests are logged using the `pino-http` middleware:

```typescript
import pinoHttp from 'pino-http';
import { getEnv } from '../utils/config.util';

export const requestLogger = pinoHttp({
  level: getEnv('LOG_LEVEL', 'info'),
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
  // Customize the logs
  customProps: (req, res) => {
    return {
      context: 'HTTP',
    };
  },
  // Redact sensitive information
  redact: {
    paths: ['req.headers.authorization'],
    censor: '[REDACTED]',
  },
});
```

## Using the Logger in Controllers and Services

```typescript
import { Controller, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { LoggerService } from '../../services/logger.service';

@Controller('/users')
@Service()
export class UsersController {
  constructor(@Inject('logger') private logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.info('Getting all users', { source: 'UsersController' });

    try {
      // Implementation
      return { users: [] };
    } catch (error) {
      this.logger.error('Failed to get users', error as Error);
      throw error;
    }
  }
}
```

## Configuration

Logging levels and other settings can be configured through environment variables:

```
LOG_LEVEL=debug  # Options: trace, debug, info, warn, error, fatal
```

## Best Practices

1. Use appropriate log levels for different types of messages
2. Include contextual information with each log message
3. Use structured logging (objects) rather than string concatenation
4. Redact sensitive information (passwords, tokens)
5. Log both the start and completion of important operations
