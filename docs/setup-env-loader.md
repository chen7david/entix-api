# ConfigService

The `ConfigService` class provides a robust, type-safe way to load and validate environment variables in your project. It is designed for scalable, enterprise-grade applications and integrates seamlessly with [dotenv](https://www.npmjs.com/package/dotenv) and [Zod](https://zod.dev/).

## Features

- Loads the appropriate `.env` file based on `NODE_ENV` and project environment enums (NodeEnv).
- Does **not** throw if the `.env` file is missing (for CI/CD compatibility).
- Validates `process.env` using a Zod schema.
- Throws a formatted error if validation fails, listing missing/invalid keys and their errors.
- Integrated with dependency injection using TypeDI.

## Usage

1. **Define your environment schema using Zod:**

```ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']),
  // Add your other environment variables here
  PORT: z.string().regex(/^\d+$/),
});
```

2. **Load and validate environment variables:**

```ts
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { ConfigService } from '@src/services/config/config.service';
import { IoC } from '@src/shared/constants/ioc.constants';
import { envSchema } from './env.schema';

// Register the schema with the container
Container.set(IoC.ENV_SCHEMA, envSchema);

// Get the ConfigService instance
const configService = Container.get(ConfigService);

// Access environment variables
const port = configService.env.PORT;
const nodeEnv = configService.env.NODE_ENV;
```

## Error Handling

- If the `.env` file does **not** exist, no error is thrown (to support CI/CD and secret managers).
- If validation fails, an error is thrown with a formatted list of missing/invalid keys and their respective errors.

## Best Practices

- Place your Zod schema in a dedicated file (e.g., `src/config/config.schema.ts`).
- Use the `ConfigService` in your application entry point to ensure all environment variables are validated before the app starts.
- For large projects, keep all configuration logic in `src/config`.

## References

- [dotenv documentation](https://www.npmjs.com/package/dotenv)
- [Zod documentation](https://zod.dev/)
- [ConfigService Documentation](./config-service.md)
