# New Relic Integration

This document explains how the New Relic integration is set up in our application.

## Overview

Our application uses [New Relic](https://newrelic.com/) for monitoring and [Pino](https://getpino.io/) for logging. We've integrated the two using the `@newrelic/pino-enricher` package, which enriches our logs with New Relic metadata, enabling distributed tracing and better log correlation.

## Setup Components

The integration consists of several components:

1. **New Relic Agent**: The main New Relic agent that collects metrics, events, and traces.
2. **New Relic Configuration**: Settings for the New Relic agent (optional).
3. **Pino Enricher**: A utility that adds New Relic metadata to our logs.
4. **Logger Service**: Our custom logger service that uses Pino with the New Relic enricher.

## Configuration

### Environment Variables

Configure New Relic using the following environment variables:

| Variable                | Description                               | Default             |
| ----------------------- | ----------------------------------------- | ------------------- |
| `NEW_RELIC_ENABLED`     | Enable or disable New Relic integration   | `false`             |
| `NEW_RELIC_LICENSE_KEY` | Your New Relic license key                | N/A                 |
| `NEW_RELIC_APP_NAME`    | The name of your application in New Relic | Value of `APP_NAME` |

### New Relic Activation Conditions

New Relic will be enabled if both of the following conditions are met:

- `NODE_ENV` is set to `production`.
- `NEW_RELIC_ENABLED` is set to `true`.

You will not see these settings in your `.env.example` file because they are injected into the Docker container by our production environment. If you need to test New Relic locally, you will need to request a license key for testing and ensure that it is specifically for your testing environment to avoid polluting production logs.

### New Relic Configuration File

Currently, we do not have a `newrelic.js` file in our project. However, you can create one if you need to add specific configurations for the New Relic agent. The `newrelic.js` file at the root of the project contains configuration for the New Relic agent. This file is automatically loaded by the New Relic agent when it's initialized.

Here’s an example of what the `newrelic.js` file might look like based on New Relic's documentation:

```javascript
'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Your Application Name'],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * This setting controls distributed tracing.
   */
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     */
    enabled: true,
  },

  /**
   * Logging configuration for New Relic agent logs
   */
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },

  /**
   * Application logging
   */
  application_logging: {
    /**
     * When true, the agent will capture log events and send them to New Relic.
     * This is separate from the Pino enricher, which adds metadata to your logs.
     * Enabling both provides the most complete logging solution.
     */
    forwarding: {
      enabled: true,
    },
  },

  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
};
```

### Starting the New Relic Module

To start the New Relic module, we have chosen to use it in the scripts section of our application. This has the limitation of not being able to turn it off in production. If you want to turn it off in production, you can remove it from the scripts section and call it in your code like this:

```typescript
import { env, envContext } from '@src/config/env.config';
if (envContext.isProduction && env.NEW_RELIC_ENABLED) require('newrelic');
// other code ...
```

### Logging Considerations

We get 100 GB of free ingest data per month, so we need to log only what is necessary and nothing more. Be mindful of the volume of logs generated to avoid exceeding this limit.

## Usage

### Example of Starting New Relic in Production

In your `package.json`, you can start the New Relic module in production by using the following script:

```json
"scripts": {
  "start": "NODE_ENV=production node -r newrelic dist/index.js"
}
```

This command sets the `NODE_ENV` to `production` and requires the New Relic module before starting your application.

### Logging with New Relic

Our `LoggerService` automatically enriches logs with New Relic metadata when `NEW_RELIC_ENABLED` is `true`. You don't need to do anything special to use it:

```typescript
import { logger } from '@src/services/logger.service';

// Log a simple message
logger.info('Application started');

// Log with context
logger.info('User logged in', { userId: '123' });

// Log an error
try {
  // Some operation that might throw
} catch (error) {
  if (error instanceof Error) {
    logger.error('Operation failed', { error });
  }
}
```

## How It Works

1. The New Relic agent is initialized before any other imports to ensure it can instrument the entire application.
2. Our `LoggerService` uses the Pino enricher to add New Relic metadata to our logs.
3. When a log is generated, the enricher adds the following metadata:
   - `entity.guid`: The GUID of the entity in New Relic.
   - `entity.name`: The name of the entity in New Relic.
   - `trace.id`: The ID of the current trace, if available.
   - `span.id`: The ID of the current span, if available.
4. This metadata allows New Relic to correlate logs with traces and other telemetry data.

## Troubleshooting

If you're having issues with the New Relic integration, check the following:

1. **Agent Logs**: Look for a `newrelic_agent.log` file in the project root directory.
2. **License Key**: Ensure your license key is correct in the environment variables.
3. **Network Access**: The New Relic agent needs outbound internet access to send data to New Relic.
4. **Node.js Version**: Ensure you're using a version of Node.js that's supported by the New Relic agent.

## Additional Resources

- [New Relic Node.js Agent Documentation](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/getting-started/introduction-new-relic-nodejs/)
- [Pino Enricher Documentation](https://github.com/newrelic/newrelic-node-log-extensions/tree/main/packages/pino-log-enricher)
- [New Relic Logs in Context](https://docs.newrelic.com/docs/logs/logs-context/configure-logs-context-nodejs/)
