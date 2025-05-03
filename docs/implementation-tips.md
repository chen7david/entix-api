# Implementation Tips

This document provides implementation tips and best practices for the Entix API project, covering various aspects of the codebase that contribute to maintainability, performance, and developer experience.

## Error Handling with Granular Error Codes

Our error handling system maps errors to appropriate HTTP responses, but for better client-side error handling, consider adding more granular error codes.

### Recommended Approach

1. **Add Error Codes to AppError**:

```typescript
export class AppError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly errorCode: string; // Add error code

  constructor(options: {
    message: string;
    status?: number;
    type?: string;
    errorCode?: string; // Add to options
    expose?: boolean;
  }) {
    // ...
    this.errorCode = options.errorCode || 'UNKNOWN_ERROR';
  }

  toResponse() {
    return {
      // ...existing response
      errorCode: this.errorCode, // Include in response
    };
  }
}
```

2. **Define Domain-Specific Error Codes**:

```typescript
// In src/domains/user/user.errors.ts
export const UserErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_DISABLED: 'USER_DISABLED',
  INVALID_USER_DATA: 'INVALID_USER_DATA',
} as const;

// In src/domains/tenant/tenant.errors.ts
export const TenantErrorCodes = {
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  TENANT_ALREADY_EXISTS: 'TENANT_ALREADY_EXISTS',
  // ...
} as const;
```

3. **Use Error Codes in Services**:

```typescript
// In a service method
if (!user) {
  throw new NotFoundError({
    message: `User with ID ${id} not found`,
    errorCode: UserErrorCodes.USER_NOT_FOUND,
  });
}
```

4. **Document in OpenAPI**:

```typescript
@OpenAPI({
  // ...
  responses: {
    '404': {
      description: 'User not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              errorCode: {
                type: 'string',
                enum: Object.values(UserErrorCodes),
              },
              // ...
            },
          },
        },
      },
    },
  },
})
```

### Benefits

1. **Better Client Experience**: Frontend can handle specific error cases
2. **Internationalization**: Error codes enable client-side translations
3. **Documentation**: Self-documenting API error responses
4. **Consistency**: Standardized error handling across domains

## Database Performance: Soft Delete Indexes

When using soft deletion with a `deletedAt` timestamp, adding an index on this column can significantly improve performance for large tables.

### Implementation

Add indexes to your schema definitions:

```typescript
export const users = pgTable('users', {
  // ... existing fields
  deletedAt: timestamp('deleted_at').index(), // Add index
});
```

Or with a custom index name:

```typescript
export const users = pgTable(
  'users',
  {
    // ... existing fields
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    deletedAtIdx: index('users_deleted_at_idx').on(table.deletedAt),
  }),
);
```

### When to Use

- For tables expected to have >10,000 rows
- For tables frequently queried with filters on `deletedAt`
- For tables with high write volume where soft-deleted records accumulate

Remember: indexes improve read performance but slightly impact write performance, so only add them where needed.

## DX Scripts & Pre-commit Hooks

To improve developer experience, consider adding or enhancing pre-commit hooks to automate code quality checks.

### Adding a Format Script to Pre-commit

1. **Ensure your package.json has the format script**:

```json
"scripts": {
  "format": "prettier --write \"**/*.{ts,js,json,md,yml,yaml}\"",
  "format:check": "prettier --check \"**/*.{ts,js,json,md,yml,yaml}\"",
  "format:precommit": "prettier --write --ignore-unknown"
}
```

2. **Create or update your pre-commit hook** in `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Format staged files
npx lint-staged

# Run linting
npm run lint
```

3. **Configure lint-staged in package.json**:

```json
"lint-staged": {
  "**/*.{ts,js,json,md,yml,yaml}": [
    "npm run format:precommit"
  ]
}
```

4. **Install lint-staged if not already present**:

```bash
npm install --save-dev lint-staged
```

### Benefits

- Automatically formats staged files before commit
- Prevents formatting issues from being committed
- Complements linting checks
- Improves code review quality (no formatting noise)

## OpenAPI Schema Registration

To ensure all DTOs are properly registered with the OpenAPI registry, follow these guidelines:

### Best Practices

1. **Create a Central Registry Function**:

```typescript
// src/openapi/registry.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerUserSchemas } from '@domains/user/user.dto';
import { registerTenantSchemas } from '@domains/tenant/tenant.dto';
// ... import other domain registrations

export function createRegistry(): OpenAPIRegistry {
  const registry = new OpenAPIRegistry();

  // Register all domain schemas
  registerUserSchemas(registry);
  registerTenantSchemas(registry);
  // ... register other domains

  return registry;
}
```

2. **Domain Registration Pattern**:

For each domain, create a registration function in the DTO file:

```typescript
// In each domain's dto.ts file
export function registerSomeDomainSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreateSomethingDto', CreateSomethingDto);
  registry.register('UpdateSomethingDto', UpdateSomethingDto);
  registry.register('SomethingDto', SomethingDto);
  // ... register all DTOs for this domain
}
```

3. **Checklist for New Domains**:

- [ ] Create `registerXyzSchemas` function in domain's DTO file
- [ ] Import and call from central registry function
- [ ] Add Zod schemas for all DTOs
- [ ] Include appropriate comments/examples for OpenAPI

4. **Validation**:

Periodically validate your OpenAPI documentation:

```bash
# Generate OpenAPI spec
curl http://localhost:3000/openapi.json > openapi.json

# Validate with OpenAPI validator
npx swagger-cli validate openapi.json
```

## Repository Generics and Query Builders

While our `BaseRepository` provides a solid foundation for CRUD operations, domain-specific repositories often need more complex queries. Here's how to extend it effectively:

### Custom Query Methods Example

```typescript
import { BaseRepository } from '@shared/repositories/base.repository';
import { users } from './user.schema';
import { User, UserId } from './user.model';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { and, eq, gt, lt, desc, asc, inArray, sql } from 'drizzle-orm';
import { Injectable } from '@shared/utils/ioc.util';

@Injectable()
export class UserRepository extends BaseRepository<typeof users, User, UserId> {
  protected readonly table = users;
  protected readonly idColumn = users.id;
  protected readonly deletedAtColumn = users.deletedAt;

  constructor(dbService: DatabaseService, loggerService: LoggerService) {
    super(dbService, loggerService);
  }

  /**
   * Finds users by email domain with pagination and optional filters
   */
  async findByEmailDomain(
    domain: string,
    options: {
      page?: number;
      pageSize?: number;
      orderBy?: 'username' | 'createdAt';
      orderDir?: 'asc' | 'desc';
      isDisabled?: boolean;
    } = {},
  ): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      pageSize = 20,
      orderBy = 'createdAt',
      orderDir = 'desc',
      isDisabled,
    } = options;

    const offset = (page - 1) * pageSize;

    // Build where clause
    const whereConditions = [
      sql`${users.email} LIKE ${'%@' + domain}`,
      ...this.buildDefaultFilters(), // Include soft delete filter
    ];

    // Add optional filters
    if (isDisabled !== undefined) {
      whereConditions.push(eq(users.isDisabled, isDisabled));
    }

    // Combine conditions
    const whereClause = and(...whereConditions);

    // Create sorting
    const orderColumn = orderBy === 'username' ? users.username : users.createdAt;
    const orderFunc = orderDir === 'asc' ? asc : desc;

    // Execute query with pagination
    const results = await this.dbService.db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderFunc(orderColumn))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    const countResult = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    return {
      users: results as User[],
      total,
    };
  }

  /**
   * Finds users with specific roles in a given tenant
   */
  async findByTenantAndRoles(tenantId: string, roleIds: string[]): Promise<User[]> {
    // This uses a join query with userTenantRoles
    // Import the necessary schema
    const { userTenantRoles } = await import('@domains/join-tables/user-tenant-roles.schema');

    const results = await this.dbService.db
      .select()
      .from(users)
      .innerJoin(
        userTenantRoles,
        and(
          eq(users.id, userTenantRoles.userId),
          eq(userTenantRoles.tenantId, tenantId),
          inArray(userTenantRoles.roleId, roleIds),
        ),
      )
      .where(isNull(users.deletedAt));

    return results.map((r) => r.users) as User[];
  }
}
```

### Benefits of Custom Query Methods

1. **Performance**: Optimized queries for specific use cases
2. **Type Safety**: Fully typed parameters and return values
3. **Encapsulation**: Business logic stays in the repository
4. **Reusability**: Domain-specific queries can be reused
5. **Maintainability**: Complex SQL is isolated and testable

### Testing Custom Queries

```typescript
describe('UserRepository custom queries', () => {
  let userRepository: UserRepository;
  let mockDb: Record<string, jest.Mock>;

  beforeEach(() => {
    // Setup mocks as in other repository tests
    // ...

    // Setup mocked query chain for complex queries
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.from = jest.fn().mockReturnThis();
    mockDb.innerJoin = jest.fn().mockReturnThis();
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.orderBy = jest.fn().mockReturnThis();
    mockDb.limit = jest.fn().mockReturnThis();
    mockDb.offset = jest.fn().mockReturnValue([
      {
        /* mock user data */
      },
    ]);
  });

  it('should find users by email domain with filters', async () => {
    // Test implementation
    // ...
  });
});
```

By extending the base repository with domain-specific methods, you get the best of both worlds: generic CRUD operations and optimized domain-specific queries.
