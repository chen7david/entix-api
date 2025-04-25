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
    this.logger.log({ level: 'info', msg: 'Doing something' });
  }
}
```

Or, get it from the container:

```ts
import { Container } from 'typedi';
import { LoggerService } from '@shared/services/logger.service';

const logger = Container.get(LoggerService);
logger.log({ level: 'info', msg: 'App started' });
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
logger.log({ level: 'error', msg: 'Something went wrong' });
logger.log({ level: 'debug', msg: 'Debugging details' });
```

## Adding Metadata

You can attach metadata to any log message:

```ts
logger.log({ level: 'info', msg: 'User created', meta: { userId: 123 } });
```

## Creating Child Loggers

Child loggers add context to every log message:

```ts
const childLogger = logger.child({ service: 'UserService' });
childLogger.info('User service started');
```

## Configuration

- Log level is set via the `LOG_LEVEL` environment variable (e.g., `info`, `debug`).
- In development, logs are pretty-printed; in production, logs are JSON.
- You can add async cleanup tasks to flush logs or close streams if needed.

## Best Practices

- Use appropriate log levels for each message.
- Attach relevant metadata for structured logs.
- Use child loggers for per-service or per-request context.
- Avoid logging sensitive information.

---

For more details, see the `LoggerService` source and tests.
