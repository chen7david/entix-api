# LoggerService Usage Guide

## Overview

`LoggerService` is a singleton, environment-aware logger built on [Pino](https://getpino.io/). It provides structured, high-performance logging with support for log levels, metadata, and child loggers. In development, logs are pretty-printed; in production, logs are JSON for easy ingestion.

## Injecting and Using LoggerService

If you use [TypeDI](https://github.com/typestack/typedi), inject `LoggerService` into your service or controller:

```ts
import { Service } from 'typedi';
import { LoggerService } from '@shared/services/logger.service';

@Service()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  doSomething() {
    this.logger.info('Doing something');
  }
}
```

Or, get it from the container:

```ts
import { Container } from 'typedi';
import { LoggerService } from '@shared/services/logger.service';

const logger = Container.get(LoggerService);
logger.info('App started');
```

## Logging at Different Levels

The available log levels are:

- `fatal`
- `error`
- `warn`
- `info`
- `debug`
- `trace`

Example:

```ts
logger.error('Something went wrong');
logger.debug('Debugging details');
```

## Adding Metadata

You can attach metadata to any log message:

```ts
logger.info('User created', { userId: 123 });
```

## Scoping Loggers with Components

The recommended way to scope loggers is to use the `component()` method, which adds a `component` field to every log message:

```ts
const userLogger = logger.component('UserService');
userLogger.info('User service started');
```

This is industry standard and aligns with best practices at Google, AWS, Microsoft, and OpenTelemetry. Use `component` to indicate the logical part of your system (service, controller, repository, etc.).

## Configuration

- Log level is set via the `LOG_LEVEL` environment variable (e.g., `info`, `debug`).
- In development, logs are pretty-printed; in production, logs are JSON.
- You can add async cleanup tasks to flush logs or close streams if needed.

## Best Practices

- Use appropriate log levels for each message.
- Attach relevant metadata for structured logs.
- Use child loggers for per-service or per-request context.
- Avoid logging sensitive information.

## Logger API Changes

The logger now exposes level-specific methods: `fatal`, `error`, `warn`, `info`, `debug`, and `trace`. Each method accepts a message and optional metadata:

```ts
logger.info('User created', { userId: 123 });
logger.error('Something went wrong', { error });
logger.trace('Trace details', { details });
```

The `child` method returns a new logger instance with the specified bindings, and the logger implements the `Logger` type interface for type safety and autocompletion.

---

For more details, see the `LoggerService` source and tests.
