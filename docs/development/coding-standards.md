---
title: Coding Standards
---

# Coding Standards

This document outlines the coding standards and best practices for developing the Entix API.

## General Principles

- Write DRY (Don't Repeat Yourself) code
- Follow SOLID principles
- Write self-documenting code with clear naming
- Keep functions and methods focused on a single responsibility
- Prioritize readability and maintainability over clever code

## TypeScript

### Types and Interfaces

- Use types instead of interfaces for consistency and better union support
- Export all types that are used in public APIs
- Use descriptive names for types
- Define types close to where they are used

```typescript
// Good
type User = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
};

// Avoid
interface IUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}
```

### Type Assertions

- Avoid type assertions (`as`) when possible
- Use type guards instead of type assertions

```typescript
// Good
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && obj !== null && 'id' in obj && 'username' in obj && 'email' in obj
  );
}

// Avoid
const user = obj as User;
```

### Null and Undefined

- Use undefined instead of null in most cases
- Be explicit about nullable types

```typescript
// Good
function findUser(id: string): User | undefined {
  // Implementation
}

// Avoid mixing null and undefined
function findUser(id: string): User | null {
  // Implementation
}
```

## Naming Conventions

### Files

- Use kebab-case for filenames
- Use the format `[name].[type].ts`:
  - `user.service.ts`
  - `auth.middleware.ts`
  - `db.config.ts`
- Test files should follow the pattern `[filename].test.ts`

### Classes and Types

- Use PascalCase for class and type names
- Use nouns for classes and types
- Suffix service classes with `Service`
- Suffix controller classes with `Controller`
- Suffix middleware classes with `Middleware`

```typescript
// Good
class UserService {}
class AuthController {}
type UserDto = {
  /* ... */
};

// Avoid
class users_service {}
class Middleware {} // Too generic
```

### Functions and Methods

- Use camelCase for function and method names
- Use verbs for functions and methods
- Be descriptive about what the function does

```typescript
// Good
function findUserById(id: string): User | undefined {
  /* ... */
}

// Avoid
function process(id: string): User | undefined {
  /* ... */
}
```

### Variables

- Use camelCase for variable names
- Use descriptive names that reveal intent
- Avoid abbreviations unless they are well known

```typescript
// Good
const userCount = users.length;

// Avoid
const cnt = users.length;
```

### Constants

- Use UPPER_SNAKE_CASE for constants that are truly constant
- Use camelCase for variables declared with const

```typescript
// Good
const MAX_USERS = 100;
const defaultLimit = 10;

// Avoid
const Default_Limit = 10;
```

## Code Structure

### Directory Structure

Follow the feature-based directory structure:

```
src/
  ├── features/
  │   ├── users/
  │   │   ├── user.service.ts
  │   │   ├── users.controller.ts
  │   │   ├── user.repository.ts
  │   │   └── user.schema.ts
  │   └── health/
  │       └── health.controller.ts
  ├── middleware/
  │   ├── error.middleware.ts
  │   └── auth.middleware.ts
  ├── services/
  │   └── logger.service.ts
  ├── config/
  │   ├── db.config.ts
  │   └── env.config.ts
  ├── utils/
  │   └── config.util.ts
  ├── types/
  │   └── index.ts
  ├── app.ts
  └── server.ts
```

### Code Organization

- Limit files to 300-400 lines
- Group related functionality together
- Export public API from index.ts files

## Documentation

### TSDoc Comments

- Add TSDoc comments for all public functions, methods, and classes
- Document parameters, return values, and thrown exceptions
- Provide examples for complex functions

````typescript
/**
 * Finds a user by their ID
 *
 * @param id - The unique identifier of the user
 * @returns The user if found, undefined otherwise
 * @throws DatabaseError if the database connection fails
 *
 * @example
 * ```ts
 * const user = await findUserById('123');
 * if (user) {
 *   console.log(user.username);
 * }
 * ```
 */
async function findUserById(id: string): Promise<User | undefined> {
  // Implementation
}
````

### Inline Comments

- Use inline comments sparingly
- Focus on why, not what or how
- Keep comments up to date with code changes

## Error Handling

- Use custom error classes for different error types
- Provide meaningful error messages
- Log all errors with appropriate context
- Handle async errors properly

## Performance Considerations

- Use connection pooling for database connections
- Avoid N+1 query problems
- Be mindful of memory usage in request handlers
- Use pagination for large collections

## Security Practices

- Validate all user input
- Use parameterized queries for database operations
- Follow the principle of least privilege
- Don't store sensitive information in logs
