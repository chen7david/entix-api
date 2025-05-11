# Authentication and Authorization Implementation

This document explains how authentication and authorization are implemented in the Entix API using JWT tokens from AWS Cognito.

## Overview

The API uses a token-based authentication system with JWT tokens issued by AWS Cognito. The implementation follows these principles:

1. **Authentication**: Verifying the identity of users via JWT tokens
2. **Authorization**: Determining if authenticated users have permission to access specific resources

## Authentication Flow

1. Users authenticate through Cognito (using the `/api/v1/auth/signin` endpoint)
2. Cognito issues JWT tokens (access, refresh, and ID tokens)
3. The client includes the access token in the `Authorization` header of subsequent requests
4. The API verifies the token signature and claims using `aws-jwt-verify`
5. If the token is valid, the user is considered authenticated

## Implementation Components

### Core Services

1. **JwtService**: Verifies JWT tokens using `aws-jwt-verify`
2. **AuthVerificationService**:
   - Extracts and verifies tokens from requests
   - Maps JWT claims to user records in the database
   - Associates users with their roles and permissions
   - Provides methods to check permissions
   - Caches user data on the request object to prevent duplicate database calls

### Routing-Controllers Integration

The implementation integrates with `routing-controllers` through:

1. **authorizationChecker**: Function used to check if users have the required permissions to access a route
2. **currentUserChecker**: Function to extract user information from JWT tokens and provide it via the `@CurrentUser()` decorator

## Usage Examples

### Protecting Routes with Permission Checks

Use the `@Authorized` decorator to protect routes:

```typescript
import { JsonController, Get, Authorized, CurrentUser } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthUser } from '@shared/services/auth/auth-verification.service';

@JsonController('/api/v1/users')
export class UsersController {
  // Requires 'users:read' permission
  @Get('/')
  @Authorized(['perm:users:read'])
  @OpenAPI({ summary: 'Get all users' })
  async getAll(@CurrentUser() user: AuthUser) {
    // Implementation...
  }

  // Accessible to any authenticated user
  @Get('/me')
  @Authorized()
  @OpenAPI({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: AuthUser) {
    // Implementation...
  }

  // Multiple permissions (any one is sufficient)
  @Put('/:id')
  @Authorized(['users:write', 'users:admin'])
  @OpenAPI({ summary: 'Update user' })
  async update(@CurrentUser() user: AuthUser) {
    // Implementation...
  }
}
```

### The 'perm:' Prefix

The `perm:` prefix is optional but recommended for clarity. The authorization checker will check for permissions regardless of whether you use the prefix:

```typescript
// These two are equivalent:
@Authorized(['perm:users:read'])
@Authorized(['users:read'])
```

### Accessing the Current User

Get the authenticated user in your controller methods:

```typescript
import { JsonController, Get, Authorized, CurrentUser } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthUser } from '@shared/services/auth/auth-verification.service';

@JsonController('/api/v1/users')
export class UsersController {
  @Get('/me')
  @Authorized()
  @OpenAPI({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: AuthUser) {
    // 'user' contains ID, roles, and permissions
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };
  }

  @Get('/profile')
  @Authorized()
  @OpenAPI({ summary: 'Get user profile with manual permission check' })
  async getProfile(@CurrentUser() user: AuthUser) {
    // You can also do manual permission checks inside controllers
    if (!user.permissions.includes('profile:read')) {
      throw new ForbiddenError('You do not have permission to view profiles');
    }

    // Implementation...
  }
}
```

## Request-Level Caching

To avoid duplicate database calls, the implementation uses request-level caching:

1. When either `@Authorized()` or `@CurrentUser()` is used on a route, the user is authenticated and stored on the request
2. Subsequent calls to get the user within the same request will use the cached user data

This optimization is especially helpful when using both decorators on the same route:

```typescript
@Get('/users/:id')
@Authorized(['perm:users:read'])  // First call: fetches and caches the user
async getUser(@Param('id') id: string, @CurrentUser() user: AuthUser) {  // Uses cached user
  // Implementation...
}
```

## Testing Authentication

When writing tests for authenticated routes, you need to mock the JWT verification process. Here's an example:

```typescript
import { Container } from 'typedi';
import { AuthVerificationService } from '@shared/services/auth/auth-verification.service';
import { createMockAuthUser } from '@tests/mocks/auth-user.mock';

describe('UserController', () => {
  beforeEach(() => {
    // Mock authentication service to return a specific user
    const mockAuthService = {
      getCurrentUser: jest.fn().mockResolvedValue(
        createMockAuthUser({
          roles: ['admin'],
          permissions: ['users:read', 'users:write'],
        }),
      ),
      checkAuthorization: jest.fn().mockResolvedValue(true),
    };

    Container.set(AuthVerificationService, mockAuthService);
  });

  // Test controller methods...
});
```

## Best Practices

1. **Always protect sensitive routes**: Use `@Authorized()` at minimum
2. **Be specific with permissions**: Use fine-grained permissions
3. **Use the perm: prefix for clarity**: Makes it clear you're checking permissions, not roles
4. **Document required permissions**: Make sure to document required permissions in OpenAPI annotations
5. **Test thoroughly**: Always write tests for both authorized and unauthorized access scenarios
