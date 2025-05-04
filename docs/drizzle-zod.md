# Drizzle-Zod Integration Guide

This guide explains how the project integrates Drizzle ORM with Zod validation through the drizzle-zod package, maintaining type safety and API documentation with OpenAPI.

## Overview

The integration allows us to:

1. Define database schemas with Drizzle ORM
2. Generate Zod validation schemas directly from Drizzle tables
3. Create API DTOs based on the database schemas
4. Automatically generate OpenAPI documentation

## Structure

The integration follows this pattern:

1. **Define Drizzle table schema** in `domain/[entity]/[entity].schema.ts`
2. **Generate entity types and schemas** using `createEntitySchema` and `createInsertEntitySchema` utilities
3. **Define API DTOs** in `domain/[entity]/[entity].dto.ts` using the entity schemas as a base
4. **Use generated types** in controllers, services, and repositories

## Example Workflow

### 1. Define Drizzle Table Schema

```typescript
// src/domains/user/user.schema.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import {
  createEntitySchema,
  createInsertEntitySchema,
  EntityType,
} from '@shared/utils/drizzle-zod.util';

// Define the table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Generate Zod schema for the entity
export const UserEntitySchema = createEntitySchema(users, {
  name: 'UserEntity',
  description: 'User entity representing a database record',
});

// Type definition for User entity
export type UserEntity = EntityType<typeof UserEntitySchema>;

// Zod schema for creating a new User
export const CreateUserEntitySchema = createInsertEntitySchema(users, {
  name: 'CreateUserEntity',
  description: 'Schema for creating a new user entity',
});

// Type definition for creating a new User
export type CreateUserEntity = EntityType<typeof CreateUserEntitySchema>;
```

### 2. Define API DTOs

```typescript
// src/domains/user/user.dto.ts
import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UserEntitySchema } from '@domains/user/user.schema';

// Create an API DTO for user creation
export const CreateUserDto = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    isActive: z.boolean().default(true),
  })
  .openapi('CreateUserDto', { description: 'Data required to create a new user.' });

// Type alias for CreateUserDto
export type CreateUserDto = z.infer<typeof CreateUserDto>;

// Based on the UserEntitySchema but customized for API responses
export const UserDto = UserEntitySchema.omit({ deletedAt: true }).openapi('UserDto', {
  description: 'Represents a user returned from the API.',
});

// Type alias for UserDto
export type UserDto = z.infer<typeof UserDto>;
```

### 3. Reference Types in the Repository

```typescript
// src/domains/user/user.repository.ts
import { Injectable } from '@shared/utils/ioc.util';
import { users, UserEntity } from '@domains/user/user.schema';
import { UserId } from '@domains/user/user.model';
import { BaseRepository } from '@shared/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<typeof users, UserEntity, UserId> {
  protected readonly table = users;
  protected readonly idColumn = users.id;
  protected readonly deletedAtColumn = users.deletedAt;

  // The repository methods now work with UserEntity
}
```

## Key Utilities

### drizzle-zod.util.ts

The core utilities for integrating Drizzle with Zod:

- **`createEntitySchema`**: Creates a Zod schema from a Drizzle table for data selection/fetching
- **`createInsertEntitySchema`**: Creates a Zod schema for inserting new records
- **`EntityType<Schema>`**: Type helper for inferring types from schemas

## Best Practices

1. **Keep schema definitions separated** from API DTOs

   - Schema definitions represent the database structure
   - DTOs represent the API contract and can transform/omit fields

2. **Use suffix naming conventions**:

   - `UserEntity`: Database representation type
   - `UserDto`: API response type
   - `CreateUserDto`: API request type for creation

3. **Leverage Zod transformation capabilities**:

   - Use `.omit()` to remove fields not needed in API responses
   - Use `.extend()` to add fields needed in API but not in database
   - Use `.pick()` to select only specific fields from a schema

4. **Register schemas with OpenAPI**:
   - Always add `.openapi()` for schemas used in API endpoints
   - Provide descriptive names and documentation

## Adding New Entities

When adding a new entity:

1. Create a Drizzle table schema in `domains/[entity]/[entity].schema.ts`
2. Generate entity schemas with `createEntitySchema` and `createInsertEntitySchema`
3. Create API DTOs in `domains/[entity]/[entity].dto.ts`
4. Register schemas in `domains/openapi/openapi.register-schema.ts`
5. Update `src/database/schema.ts` to include the new schema

## Query Type Handling

For complex queries, you can use intersection and union types to create more specific entity types:

```typescript
// Example of a specialized entity type
type UserWithProfile = UserEntity & { profile: ProfileEntity };

// Example of a partial entity selection
type UserSummary = Pick<UserEntity, 'id' | 'name' | 'email'>;
```

## Testing

When testing with drizzle-zod generated types, remember:

1. Use `z.infer<typeof MySchema>` type aliases in test files
2. Mock the exact shape of the entity as defined by the schema
3. Check type compatibility with the entity schema when asserting mock objects
