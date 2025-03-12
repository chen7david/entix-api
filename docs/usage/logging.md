---
title: Logging Strategy
---

# Logging Strategy

Entix API uses [Pino](https://getpino.io/) for fast and structured logging. Our logging strategy is designed to provide comprehensive insights while maintaining performance.

## Logger Configuration

The logger is configured differently based on the environment:

```typescript
import pino from 'pino';
import { Environment } from '@src/types/app.types';

const baseLogger = pino({
  level: env.NODE_ENV !== Environment.Production ? 'debug' : 'info',
  transport:
    env.NODE_ENV !== Environment.Production
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
          },
        }
      : undefined,
  formatters: {
    level: label => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  name: 'entix-api',
});
```

## Log Levels

We use the following log levels (from highest to lowest priority):

1. **fatal**: System is unusable
2. **error**: Error conditions
3. **warn**: Warning conditions
4. **info**: Normal but significant events
5. **debug**: Detailed debug information
6. **trace**: Very detailed debug information

## Contextual Logging

Create context-specific loggers for different parts of the application:

```typescript
const dbLogger = logger.setContext('Database');
const authLogger = logger.setContext('Auth');

dbLogger.info('Database connection established');
authLogger.warn('Invalid login attempt');
```

## HTTP Request Logging

We use `pino-http` middleware for automatic HTTP request logging:

```typescript
import pinoHttp from 'pino-http';

const httpLogger = pinoHttp({
  logger: baseLogger,
  customLogLevel: (res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    return 'info';
  },
  customSuccessMessage: res => {
    return `${res.req.method} ${res.req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage: (err, res) => {
    return `${res.req.method} ${res.req.url} failed with ${res.statusCode}`;
  },
});
```

## Best Practices

1. **Use Appropriate Log Levels**

   ```typescript
   // Error conditions
   logger.error('Database connection failed', error);

   // Warning conditions
   logger.warn('Rate limit approaching threshold');

   // Normal operations
   logger.info('Server started on port 3000');

   // Debug information
   logger.debug('Processing request payload', { payload });
   ```

2. **Include Context**

   ```typescript
   logger.info('User action completed', {
     userId: user.id,
     action: 'profile_update',
     changes: changes,
   });
   ```

3. **Error Logging**
   ```typescript
   try {
     await someOperation();
   } catch (error) {
     logger.error('Operation failed', {
       error: error.message,
       stack: error.stack,
       context: {
         /* relevant context */
       },
     });
   }
   ```

## Environment-Specific Configuration

- **Development**: Colorized, pretty-printed logs
- **Test**: Minimal logging (error level only)
- **Production**: JSON format for machine processing

## Log Rotation

In production, use a log rotation solution like `logrotate` to manage log files:

```bash
/var/log/entix-api/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

## Monitoring and Alerts

Configure log monitoring to alert on important events:

1. Error rate exceeds threshold
2. Authentication failures
3. API response times above threshold
4. Database connection issues
5. Rate limit violations
