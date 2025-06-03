# Setting Up Environment Management System

This document explains how the environment configuration system works in our application. We've implemented a type-safe, testable solution for managing environment variables using Zod for validation and TypeDI for dependency injection.

## Architecture

Our environment management system consists of two main services:

1. **EnvService**: Responsible for loading environment variables from `.env` files based on the current `NODE_ENV`
2. **ConfigService**: Validates environment variables against a schema and provides type-safe access

### Dependency Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Application │────▶│ConfigService│────▶│ EnvService  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Schema   │     │  .env files │
                    │  Validation │     │             │
                    └─────────────┘     └─────────────┘
```

## Key Components

### EnvService

The `EnvService` is responsible for:

- Loading environment variables from the appropriate `.env` file based on NODE_ENV
- Providing methods to get, set, and check environment variables
- Supporting dependency injection of environment variables for testing

```typescript
@Injectable()
export class EnvService {
  private env: Record<string, unknown>;

  constructor(private readonly injectedEnv?: Record<string, string>) {
    if (injectedEnv) {
      this.env = injectedEnv;
    } else {
      const envPath = this.getEnvPath(process.env.NODE_ENV as NodeEnv);
      this.env = this.loadEnv(envPath);
    }
  }

  // Methods for accessing env variables...
}
```

### ConfigService

The `ConfigService` is responsible for:

- Validating environment variables against a Zod schema
- Providing type-safe access to configuration values
- Throwing descriptive errors when validation fails

```typescript
@Injectable()
export class ConfigService<T extends ZodObject<z.ZodRawShape>> {
  private config: z.infer<T>;

  constructor(private envService: EnvService) {
    this.config = this.validateEnv(envConfigSchema, this.envService.getProcessEnv());
  }

  // Type-safe getter method
  get<K extends keyof z.infer<T>>(key: K): z.infer<T>[K] {
    return this.config[key];
  }
}
```

### Schema Definition

We use Zod to define a schema for our environment variables, which provides:

- Type safety through TypeScript integration
- Runtime validation
- Automatic type inference

```typescript
export const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_PORT: z.coerce.number(),
  APP_NAME: z.string(),
});

// Automatically infer the type from the schema
export type Config = z.infer<typeof envConfigSchema>;
```

## Testing Approach

Our environment system is designed for testability:

1. **Mock Services**: We've created mock implementations of both services for testing:

   - `MockEnvService`: For providing test environment values
   - `MockConfigService`: For providing test configuration values

2. **Dependency Injection**: Using TypeDI for dependency injection allows easy swapping of real services with mocks:

```typescript
// In tests
Container.set(
  EnvService,
  new MockEnvService({
    NODE_ENV: 'test',
    APP_PORT: '3000',
    APP_NAME: 'Test App',
  }),
);
```

3. **Constructor Injection**: Providing an optional environment map to `EnvService` allows tests to inject custom values:

```typescript
// Direct instantiation for tests
const envService = new EnvService({
  NODE_ENV: 'test',
  APP_PORT: '3000',
});
```

## Application Lifecycle

1. **Bootstrap**: During application startup, the DI container initializes services
2. **Environment Loading**: `EnvService` loads variables from the appropriate `.env` file
3. **Validation**: `ConfigService` validates environment variables against the schema
4. **Application Usage**: Other services request `ConfigService` from the DI container and use it to access configuration

## Best Practices

1. **Always use ConfigService**: Never access `process.env` directly in your application code
2. **Type-safe access**: Utilize the type-safe `get` method to access configuration values
3. **Testing**: Use mocks for both services in tests to avoid relying on real environment variables
4. **Schema updates**: When adding new environment variables, always update the schema first

## Example Usage

```typescript
@Service()
class DatabaseService {
  constructor(private readonly config: ConfigService) {}

  connect() {
    // Type-safe access to configuration
    const dbHost = this.config.get('DB_HOST');
    const dbPort = this.config.get('DB_PORT'); // Automatically a number

    // Connect to database...
  }
}
```

This type-safe approach ensures that configuration errors are caught early, either at compile-time through TypeScript or at application startup through Zod validation.
