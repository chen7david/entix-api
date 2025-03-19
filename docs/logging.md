# Logging

This document describes how to use the logging system in the application, including the New Relic integration.

## Overview

The application uses [Pino](https://getpino.io) as the logging library, which provides high-performance logging with a small footprint. The `LoggerService` class wraps Pino to provide additional functionality, including:

- Structured logging with JSON output
- Context-based logging
- Child loggers for components
- Request context creation
- Error serialization
- New Relic integration

## Basic Usage

```typescript
import { logger } from '@src/services/logger.service';

// Simple log messages
logger.info('Application started');
logger.error('Something went wrong');

// With context
logger.info('User logged in', { userId: '123', tenantId: '456' });

// Logging errors
try {
  // Some code that might throw
} catch (error) {
  logger.error('Failed to process request', { error });
}
```

## Log Levels

The following log levels are supported, in order of increasing severity:

- `TRACE`: Detailed debugging information
- `DEBUG`: Debugging information useful for developers
- `INFO`: Information messages that highlight the progress of the application
- `WARN`: Potentially harmful situations that might lead to errors
- `ERROR`: Error events that might still allow the application to continue running
- `FATAL`: Very severe error events that will presumably lead the application to abort
- `SILENT`: Special level that turns off all logging (used for testing)

The application's log level can be controlled via the `LOG_LEVEL` environment variable.

## Child Loggers

You can create child loggers that inherit the configuration of the parent logger but include additional context:

```typescript
// Create a child logger for a specific component
const userServiceLogger = logger.child({ component: 'UserService' });

// All logs from this logger will include the component field
userServiceLogger.info('User created', { userId: '123' });
```

## Request Logging

For HTTP requests, you can create a request context to include request-specific information in your logs:

```typescript
import { logger } from '@src/services/logger.service';

// In your request handler
const requestLogger = logger.child(logger.createRequestContext(req));

// All logs will include request information
requestLogger.info('Processing request');
```

## New Relic Integration

The logger integrates with New Relic to send logs directly to the New Relic platform when running in production.

### Prerequisites

1. Install the required packages:

   ```bash
   npm install --save newrelic @newrelic/pino-enricher
   ```

2. Configure New Relic:
   - Add a `newrelic.js` configuration file to the root of your project
   - Initialize New Relic as early as possible in your application

### Configuration

To enable New Relic logging, set the following environment variables:

- `NEW_RELIC_ENABLED`: Set to `true` to enable New Relic integration
- `NEW_RELIC_LICENSE_KEY`: Your New Relic license key
- `NEW_RELIC_APP_NAME`: The name of your application in New Relic

### How it Works

When New Relic integration is enabled and the application is running in production:

1. The main New Relic agent is initialized at the start of the application
2. The logger uses the `@newrelic/pino-enricher` to enrich log entries with New Relic metadata
3. Log entries will include distributed tracing information, linking logs to transactions and spans
4. JSON-formatted logs will be sent to New Relic's log management platform

### Example Configuration

```sh
# .env.production
NODE_ENV=production
LOG_LEVEL=info
NEW_RELIC_ENABLED=true
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=your_app_name
```

### Running with New Relic Enabled

To run the application with New Relic:

```bash
# Development with New Relic (not typical)
NODE_ENV=development NEW_RELIC_ENABLED=true npm run dev

# Production with New Relic
npm run prod

# Or using the production start script
npm run start
```

### Troubleshooting

If logs are not appearing in New Relic:

1. **Verify environment variables**:

   - Check that `NEW_RELIC_ENABLED` is set to `true`
   - Verify your license key is correct in `NEW_RELIC_LICENSE_KEY`
   - Confirm the app name in `NEW_RELIC_APP_NAME`

2. **Check New Relic initialization**:

   - Make sure `require('newrelic')` is the first line in your entry file
   - For TypeScript projects, use `// eslint-disable-next-line @typescript-eslint/no-var-requires` to avoid linting errors

3. **Verify agent connection**:

   - Look for logs from the New Relic agent at startup showing successful connection
   - Check for the `newrelic_agent.log` file in your project root

4. **Debug mode**:

   - Set `NEW_RELIC_LOG_LEVEL=debug` for more verbose agent logging
   - Check the `newrelic_agent.log` file for detailed information

5. **Restart the application**:
   - Sometimes a complete restart is needed after configuration changes

## Testing

For unit tests, you can use the `createSilentLogger` function to create a logger that doesn't produce any output:

```typescript
import { createSilentLogger } from '@src/services/logger.service';

// In your test setup
const testLogger = createSilentLogger();

// Use testLogger in your components under test
const userService = new UserService(testLogger);
```

## Custom Configuration

You can create a custom logger with specific options:

```typescript
import { createLogger, LogLevel } from '@src/services/logger.service';

const customLogger = createLogger({
  level: LogLevel.DEBUG,
  appName: 'custom-app',
  prettyPrint: true, // For local development
  enableNewRelic: false, // Disable New Relic
  baseFields: {
    version: '1.0.0',
    environment: 'staging',
  },
});
```
