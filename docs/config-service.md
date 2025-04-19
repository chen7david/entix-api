# ConfigService Documentation

The `ConfigService` provides a robust, type-safe way to manage environment variables throughout your application. It validates and loads environment variables using Zod schemas, ensuring type safety and runtime validation.

## Overview

`ConfigService` is responsible for:

1. Loading the appropriate `.env` file based on the application environment (development, test, production)
2. Validating environment variables against a schema
3. Providing typed access to environment variables
4. Integrating with dependency injection for seamless usage throughout the application

## How It Works

The service performs the following steps during initialization:

1. Determines which `.env` file to load based on `NODE_ENV`
2. Loads the environment file into `process.env` (if it exists)
3. Validates `process.env` against a Zod schema
4. Makes validated environment variables available through a typed interface

## Usage

### Basic Usage

```typescript
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { ConfigService } from '@src/services/config/config.service';

// Get the ConfigService instance
const configService = Container.get(ConfigService);

// Access environment variables in a type-safe way
const port = configService.env.PORT;
const nodeEnv = configService.env.NODE_ENV;
```

### With Dependency Injection

For services that need access to configuration:

```typescript
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { ConfigService } from '@src/services/config/config.service';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  doSomething() {
    const port = this.configService.env.PORT;
    console.log(`Service running on port ${port}`);
  }
}
```

## Adding New Environment Variables

Environment variables are defined and validated in `src/config/config.schema.ts`. This file is purposely placed in the project's root config directory to be more discoverable by developers.

### Steps to Add a New Environment Variable

1. Open `src/config/config.schema.ts`
2. Add a new field to the `appConfigSchema` object with the appropriate Zod validator
3. Update your `.env` files to include the new variable

### Example

To add a new `API_KEY` environment variable:

```typescript
// src/config/config.schema.ts
import { NodeEnv } from '@src/shared/constants/app.constants';
import { z } from 'zod';

export const appConfigSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().min(1024).max(65535),
  // Add new environment variable
  API_KEY: z.string().min(1, { message: "API_KEY can't be empty" }),
});

export const envSchema = appConfigSchema;
export type EnvSchema = z.infer<typeof envSchema>;
```

Then update your `.env` file:

```
NODE_ENV=development
PORT=3000
API_KEY=your-api-key-here
```

### Validator Options

Zod offers many validators to ensure your environment variables meet your requirements:

- **Strings**: `z.string()` - For API keys, connection strings, etc.
  - Optional modifiers: `.min(length)`, `.max(length)`, `.url()`, `.email()`, etc.
- **Numbers**: `z.number()` or `z.coerce.number()` - For ports, timeouts, etc.
  - Optional modifiers: `.min(value)`, `.max(value)`, `.int()`, etc.
- **Booleans**: `z.boolean()` or `z.coerce.boolean()` - For feature flags
- **Enums**: `z.enum(['value1', 'value2'])` or `z.nativeEnum(MyEnum)` - For restricted values

### Optional Variables

For optional environment variables, use the `.optional()` modifier:

```typescript
export const appConfigSchema = z.object({
  // ... other variables
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .optional()
    .default('info'),
});
```

## Environment File Selection

The `ConfigService` selects which `.env` file to load based on the `NODE_ENV` environment variable:

- `NODE_ENV=development` → Loads `.env`
- `NODE_ENV=test` → Loads `.env.test`
- `NODE_ENV=production` → Loads `.env`
- No `NODE_ENV` specified → Loads `.env`

This allows for environment-specific configuration across different deployment contexts.

## Error Handling

If validation fails, the `ConfigService` throws a formatted error message listing all invalid environment variables and why they failed:

```
Environment variable validation failed:
- PORT: Expected number, received string
- API_KEY: Required
```

This makes it easy to identify and fix configuration issues during application startup.

## Best Practices

1. **Validate Everything**: Always add appropriate validators to ensure runtime type safety
2. **Use Meaningful Defaults**: For optional variables, provide sensible defaults
3. **Document Requirements**: Add inline comments to explain validation requirements
4. **Keep Secrets Secure**: Never commit real secrets to your repository
5. **Organized Structure**: Group related environment variables in the schema

## Related Documentation

- [TypeDI Documentation](./dependency-injection.md) - Details on dependency injection
- [Environment Management](./setup-env-loader.md) - How environments are managed
- [Application Bootstrap](./app-service.md) - How the application initializes
