# JWT Authentication and Authorization Implementation

This implementation provides a robust, JWT-based authentication and authorization system for the Entix API using AWS Cognito JWT tokens.

## Overview

The JWT authentication and authorization system consists of:

1. **JWT Verification** with the `aws-jwt-verify` library
2. **Permission-based Access Control**
3. **Integration with Routing Controllers** for declarative security

## Architecture

The implementation follows these principles:

- **Separation of Concerns**: Authentication logic is separated from business logic
- **Middleware-based**: Uses routing-controllers middleware for security
- **Pluggable**: Can be adapted to different JWT providers
- **DRY**: Reduces code duplication with decorators
- **Performance Optimized**: User data is cached on the request object to prevent duplicate database calls

## Components

### JwtService

Verifies JWT tokens from Cognito using aws-jwt-verify.

```typescript
// Example usage
const jwtService = Container.get(JwtService);
const token = 'eyJhbG...';
const payload = await jwtService.verifyToken(token);
```

### AuthVerificationService

Extracts user information from JWTs and checks permission-based access.

```typescript
// Example usage
const authService = Container.get(AuthVerificationService);
const user = await authService.getCurrentUser(req);
if (user && authService.hasPermission(user, 'read:users')) {
  // User has permission
}
```

### Auth Decorators

#### Using the `@Authorized` Decorator

The system uses the built-in `@Authorized` decorator for permission-based authorization:

1. **Basic authentication** (no specific permissions):

```typescript
// Require any authenticated user
@Authorized()
async authenticatedUserEndpoint() { ... }
```

2. **Permission-based authorization**:

```typescript
// Require 'read:users' permission using the prefix syntax
@Authorized(['perm:read:users'])
async viewUsersEndpoint() { ... }

// Require 'write:users' permission directly (no prefix)
@Authorized(['write:users'])
async writeUsersEndpoint() { ... }

// Multiple permissions (any one is sufficient)
@Authorized(['read:users', 'admin:users'])
async usersEndpoint() { ... }
```

### CurrentUser Parameter Decorator

Allows direct access to the authenticated user in controller methods:

```typescript
@Get('/profile')
@Authorized()
getProfile(@CurrentUser() user: AuthUser) {
  return {
    id: user.id,
    username: user.username,
    ...
  };
}
```

## Performance Optimization

The implementation uses request-level caching to prevent duplicate database calls:

1. When `@Authorized()` is used on a route, it authenticates the user
2. When `@CurrentUser()` is used in the method, it reuses the already authenticated user from the request cache

This optimization avoids unnecessary database queries when both decorators are used on the same route.

## Getting Started

To use the authentication system, follow these steps:

1. **Authentication**: Users authenticate through `/api/v1/auth/signin` to get JWT tokens
2. **API Requests**: Include the token in the Authorization header: `Authorization: Bearer <token>`
3. **Protecting Routes**: Use `@Authorized()` with permissions
4. **Accessing User**: Use `@CurrentUser()` parameter decorator

## Security Features

- **Token validation**: Signature verification, expiration checks
- **Permission-based access control**: Fine-grained permissions
- **OpenAPI integration**: Documents security requirements

## Documentation

- See `docs/auth-implementation.md` for detailed implementation documentation
- See `docs/api-dtos.md` for API endpoint documentation
- Sample demo controller in `src/domains/demo/demo-permission.controller.ts`

## Testing

Tests are provided for:

- JWT verification (`src/shared/services/jwt/jwt.service.spec.ts`)
- Auth verification (`src/shared/services/auth/auth-verification.service.spec.ts`)
- Demo controller (`src/domains/demo/demo-permission.controller.spec.ts`)

## Future Improvements

- Implement JWT token revocation
- Add refresh token rotation
- Support API key authentication for service accounts
- Add multi-factor authentication support
- Create permission inheritance hierarchies
