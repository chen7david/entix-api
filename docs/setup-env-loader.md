# Environment Configuration with EnvService

The `EnvService` provides a robust, type-safe, and injectable solution for loading and validating environment variables in your project. It is designed for scalable, enterprise-grade applications and integrates seamlessly with [TypeDI](https://github.com/typestack/typedi), [dotenv](https://www.npmjs.com/package/dotenv), and [Zod](https://zod.dev/).

## Features

- **Dependency Injection Ready:** Fully compatible with TypeDI for clean dependency management.
- **Environment Aware:** Loads the appropriate `.env` file based on `NODE_ENV` and project environment enums.
- **CI/CD Friendly:** Does not throw if the `.env` file is missing (for CI/CD compatibility).
- **Type-Safe:** Validates `process.env` using a Zod schema with full TypeScript support.
- **Helpful Errors:** Throws readable, formatted errors when validation fails.
- **Testable:** Easily mockable for unit and integration tests.

## Usage

### 1. Define Your Environment Schema Using Zod

```ts
// src/config/config.schema.ts
import { z } from 'zod';

export const envShema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']),
  PORT: z.coerce.number().min(1024).max(65535),
  // Add your other environment variables here
});
```

### 2. Inject and Use EnvService in Your Classes

```ts
// src/domains/users/users.service.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { EnvService } from '@src/services/env/env.service';

@Injectable()
export class UsersService {
  constructor(private readonly envService: EnvService) {}

  getServerInfo() {
    // Access type-safe environment variables
    const port = this.envService.env.PORT;
    const nodeEnv = this.envService.env.NODE_ENV;

    return { port, nodeEnv };
  }
}
```

## Error Handling

When validation fails, you'll receive a clear, formatted error message:

```
╭──────────────────────────────╮
│  Environment Config Error    │
╰──────────────────────────────╯

Missing or invalid variables:
- PORT: Expected number, received nan

Please check your environment variables and try again.
```

## Testing

EnvService is designed for easy testing. See the [Environment Service Testing](./setup-env-loader-testing.md) guide for examples of how to test services that use EnvService.

## Best Practices

- **Place Schema Files in `src/config`:** Keep all environment schema definitions in one place.
- **Use Dependency Injection:** Always inject EnvService rather than creating new instances.
- **Don't Manually Register:** The `@Injectable()` decorator handles registration with TypeDI.
- **Custom Schema for Specific Domains:** Consider passing domain-specific schemas for specialized services.

## References

- [TypeDI Documentation](https://github.com/typestack/typedi)
- [dotenv Documentation](https://www.npmjs.com/package/dotenv)
- [Zod Documentation](https://zod.dev/)
- [Dependency Injection Guide](./dependency-injection.md)
