# New Relic Integration

This document explains how to configure and use the New Relic APM and logging integration in the Entix API.

## Overview

The Entix API integrates with New Relic for:

1. Application Performance Monitoring (APM)
2. Structured logging with enhanced context
3. Distributed tracing

The integration uses the following packages:

- `newrelic` - The core New Relic Node.js agent
- `@newrelic/pino-enricher` - Enhances logs with New Relic metadata
- `pino` - The logging library used throughout the application

## Configuration

### Environment Variables

The following environment variables are used for New Relic configuration:

- `NEW_RELIC_LICENSE_KEY` - Your New Relic license key (required for production)
- `NEW_RELIC_APP_NAME` - The application name in New Relic (defaults to "entix-api")
- `NEW_RELIC_LOG_LEVEL` - Log level for the New Relic agent (defaults to "info")
- `SERVICE_NAME` - Service name used in logs (defaults to "entix-api")

### newrelic.js

The `newrelic.js` file in the project root contains the configuration for the New Relic agent. It reads values from environment variables and provides sensible defaults.

## Usage

### Starting with New Relic

In production, use the `start:newrelic` script to ensure New Relic is loaded before any other modules:

```bash
npm run start:newrelic
```

This runs the application with the `-r newrelic` flag, which preloads the New Relic agent.

### Logger Service

The `LoggerService` automatically enriches logs with New Relic metadata in production mode. This includes:

- Transaction IDs
- Trace IDs
- Span IDs
- Entity information

This enables correlation between logs and APM data in the New Relic UI.

### New Relic Service

The `NewRelicService` provides utilities for working with New Relic:

```typescript
// Example: Add custom attributes to the current transaction
newRelicService.addCustomAttributes({
  userId: '123',
  orderValue: 99.99,
  isPremium: true,
});

// Example: Record a custom event
newRelicService.recordCustomEvent('Purchase', {
  productId: 'ABC123',
  amount: 49.99,
});
```

## Troubleshooting

### Verifying New Relic is Working

1. Check application logs for "New Relic monitoring is enabled" message at startup
2. Logs should contain New Relic metadata (`entity.guid`, `trace.id`, etc.)
3. Data should appear in the New Relic UI within a few minutes of traffic

### Common Issues

- **No data in New Relic UI**: Verify your license key is correct
- **Missing transaction data**: Ensure the application is started with `npm run start:newrelic`
- **Missing log correlation**: Check that `@newrelic/pino-enricher` is working correctly

## Development

During development, New Relic is automatically disabled. The code includes safeguards to prevent loading New Relic in non-production environments.

When running tests, all New Relic functionality is properly mocked to ensure tests are not affected by the integration.
