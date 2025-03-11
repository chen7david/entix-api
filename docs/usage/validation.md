---
title: Validation with Zod
---

# Validation

Entix API uses [Zod](https://github.com/colinhacks/zod) for runtime type validation and schema definition. This ensures that all data entering and leaving the system matches our expected types and formats.

## Environment Variables Validation

We use Zod to validate environment variables to ensure all required configuration is present and correctly formatted:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().transform(Number),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
});

// Validate and transform environment variables
const env = envSchema.parse(process.env);
```

## Request Validation

For API endpoints, use Zod schemas to validate request bodies, query parameters, and URL parameters:

```typescript
import { z } from 'zod';
import { Body, JsonController, Post } from 'routing-controllers';

const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

@JsonController('/users')
export class UserController {
  @Post('/')
  async createUser(@Body() body: unknown) {
    const validatedData = CreateUserSchema.parse(body);
    // Process validated data...
  }
}
```

## Best Practices

1. **Type Inference**: Use `z.infer<typeof Schema>` to get TypeScript types from Zod schemas
2. **Reusable Schemas**: Create shared schemas for common validation patterns
3. **Custom Error Messages**: Provide clear error messages for validation failures
4. **Transform Data**: Use Zod's transform feature to clean and format data
5. **Nested Validation**: Create complex schemas by composing simpler ones

## Error Handling

Validation errors are caught by our global error handler and transformed into consistent API responses:

```typescript
try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format and return validation errors
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    // Handle the formatted errors...
  }
}
```

## Common Validation Patterns

### Optional Fields

```typescript
const schema = z.object({
  required: z.string(),
  optional: z.string().optional(),
});
```

### Arrays

```typescript
const schema = z.object({
  tags: z.array(z.string()).min(1).max(10),
});
```

### Enums

```typescript
const schema = z.object({
  role: z.enum(['admin', 'user', 'guest']),
});
```

### Custom Validation

```typescript
const schema = z.object({
  password: z
    .string()
    .min(8)
    .refine(pwd => /[A-Z]/.test(pwd), 'Password must contain at least one uppercase letter'),
});
```
