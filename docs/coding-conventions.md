# Coding Conventions for the Codebase

This guide outlines the coding conventions for the entire codebase, including naming, typing, dependency injection, and testing practices. All contributors must follow these rules to ensure consistency, readability, and maintainability.

## Variable Naming Conventions

### Constants

- Use ALL_UPPERCASE with underscores (e.g., `MAX_RETRIES`) **only** for values that are true constants: never reassigned, never generated at runtime, and global in scope (used across multiple files or modules).
- Do **not** use all-uppercase for variables that are generated at runtime (e.g., with `faker`) or are only used within a single file or block.

### Local Variables

- Use `camelCase` for variables that are scoped to a single file, function, or block (e.g., `mockUserId`).
- This applies to all mock data, test doubles, and any value that is not a true constant.

### TypeScript Types

- Prefer using `type` over `interface` for type definitions, unless you specifically need interface features (e.g., declaration merging or class implementation).
- All objects should be explicitly typed (e.g., `const user: User = ...`).

## Dependency Injection and Testing

- Prefer swapping implementations in the DI container for testing, using TypeDI's `Container.set()` and `Container.reset()`.
- Use Jest mocks only for non-DI dependencies or global effects.
- Always reset the DI container after each test to avoid cross-test pollution.

## General Coding Conventions

- Use `faker.js` for generating mock data such as UUIDs, emails, and names in tests.
- Keep code DRY by reusing variables and helper functions where possible.
- Add TSDoc-compliant comments above all functions, methods, and test helpers for clarity and maintainability.
- Use Prettier and ESLint to enforce formatting and linting rules.

## Architectural and Naming Patterns

### Domain-Driven Design (DDD)

- Organize code by domain (feature) with each domain containing its own controllers, services, repositories, DTOs, schemas, and tests.

### Repository Pattern

- Use a shared abstract `BaseRepository` for CRUD operations, extended by domain-specific repositories.

### Service Layer

- Encapsulate business logic in service classes, injected via TypeDI.

### Dependency Injection (DI)

- Use TypeDI for dependency management. Always reset the container in tests.

### DTOs and Validation

- Define DTOs with Zod schemas for validation and OpenAPI docs. Infer types from schemas.

### Constants and Enums

- Use ALL_UPPERCASE for true constants and `enum` for related groups.

### Middleware

- Place Express middleware in `src/shared/middleware`, each as a function with `(req, res, next)`.

### Utilities

- Place helpers in `src/shared/utils`, name with `.util.ts`, and document with TSDoc.

### Type Naming

- Use PascalCase for all types and enums.

### Testing

- Colocate tests with domains, use `faker.js` for mock data, and follow DRY and TSDoc practices.

---

_These conventions help ensure consistency, readability, and maintainability across the entire codebase._

## Further Reading

- [TypeDI Testing Docs](https://github.com/typestack/typedi#testing)
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)
