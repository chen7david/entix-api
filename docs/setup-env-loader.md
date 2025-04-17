# Environment Loader (`EnvLoader`)

The `EnvLoader` class provides a robust, type-safe way to load and validate environment variables in your project. It is designed for scalable, enterprise-grade applications and integrates seamlessly with [dotenv](https://www.npmjs.com/package/dotenv) and [Zod](https://zod.dev/).

## Features

- Loads the appropriate `.env` file based on `NODE_ENV` and project environment enums (NodeEnv).
- Does **not** throw if the `.env` file is missing (for CI/CD compatibility).
- Validates `process.env` using a Zod schema.
- Throws a formatted error if validation fails, listing missing/invalid keys and their errors.
- Designed for future dependency injection (IoC/DI) use.

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
import { EnvLoader } from '../config/env-loader.service';
import { envSchema } from './env.schema';

const envLoader = new EnvLoader(envSchema);
const env = envLoader.env;

// Now use env.PORT, env.NODE_ENV, etc. with full type safety
```

## Error Handling

- If the `.env` file does **not** exist, no error is thrown (to support CI/CD and secret managers).
- If validation fails, an error is thrown with a formatted list of missing/invalid keys and their respective errors.

## Best Practices

- Place your Zod schema in a dedicated file (e.g., `src/config/env.schema.ts`).
- Use the `EnvLoader` in your application entry point to ensure all environment variables are validated before the app starts.
- For large projects, keep all configuration logic in `src/config`.

## References

- [dotenv documentation](https://www.npmjs.com/package/dotenv)
- [Zod documentation](https://zod.dev/)
