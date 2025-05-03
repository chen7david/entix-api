# Entix API

[![Node.js](https://img.shields.io/badge/Node.js-18+-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeDI](https://img.shields.io/badge/TypeDI-0.10+-F16B75?logo=typedi&logoColor=white)](https://github.com/typestack/typedi)
[![Zod](https://img.shields.io/badge/Zod-3.x-3068b2?logo=zod&logoColor=white)](https://zod.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.29+-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pino](https://img.shields.io/badge/Pino-8.x-20A39E?logo=pino&logoColor=white)](https://getpino.io/)
[![Jest](https://img.shields.io/badge/Jest-29.x-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.x-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)

Modern, type-safe, and feature-rich REST API boilerplate built with Node.js, Express, TypeScript, TypeDI, Zod, and Drizzle ORM. This project provides a solid foundation for creating scalable, maintainable, and secure multi-tenant SaaS applications.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database & ORM](#database--orm)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security](#security)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Recent Updates](#recent-updates)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- **Modern Stack**: Node.js, TypeScript, Express.js, PostgreSQL
- **Dependency Injection**: Clean architecture using TypeDI
- **API Documentation**: Automatic OpenAPI generation
- **Database ORM**: Drizzle ORM for type-safe database access
- **Schema Management**: Migrations, rollbacks, and change tracking
- **Multi-Tenant RBAC**: Role-based access control with tenant isolation
- **Validation**: Request/response validation with Zod
- **Testing**: Comprehensive test suite with Jest
- **Logging**: Structured logging with Pino
- **Error Handling**: Centralized error handling with typed errors
- **Dev Environment**: Dev Containers for consistent development
- **Authentication**: AWS Cognito integration
- **Security**: CORS, Helmet, rate limiting, etc.
- **CI/CD**: GitHub Actions, Docker, Jenkins integration

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chen7david/entix-api.git
   cd entix-api
   ```

2. **Open in Dev Container:**

   - Open the folder in VS Code
   - Click "Reopen in Container" when prompted or use Command Palette

3. **Set up environment:**

   ```bash
   cp .env.example .env
   cp .env.example .env.test
   npm install
   ```

4. **Initialize database:**

   ```bash
   npm run db:push
   npm run db:push-test
   ```

5. **Run development server:**

   ```bash
   npm run dev
   ```

6. **Verify setup:**
   - Health check: http://localhost:3000/health
   - API docs: http://localhost:3000/openapi.json

### Using the Dev Container

The Dev Container provides a consistent development environment with:

- Node.js runtime
- PostgreSQL database
- Development tools
- Proper dependencies

This eliminates "works on my machine" problems and makes onboarding new developers easier.

## Project Structure

```
entix-api/
├── .devcontainer/    # Dev Container configuration
├── .github/          # GitHub Actions workflows
├── .husky/           # Git hooks for code quality
├── docs/             # Documentation files
├── drizzle/          # Database migrations and metadata
├── src/
│   ├── database/     # Database-related files
│   ├── domains/      # Business domain modules
│   │   ├── auth/     # Authentication/authorization
│   │   ├── health/   # Health check endpoint
│   │   ├── join-tables/  # Junction tables for relationships
│   │   ├── openapi/  # OpenAPI documentation
│   │   ├── permission/  # Permissions for RBAC
│   │   ├── role/     # Roles for RBAC
│   │   ├── tenant/   # Multi-tenant functionality
│   │   └── user/     # User management
│   └── shared/       # Shared utilities and services
│       ├── middleware/  # Express middleware
│       ├── repositories/  # Base repository pattern
│       ├── services/   # Core services
│       ├── types/      # Shared TypeScript types
│       └── utils/      # Utility functions
├── .eslintrc.cjs     # ESLint configuration
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore patterns
├── drizzle.config.ts # Drizzle ORM configuration
├── jest.config.js    # Jest test configuration
├── package.json      # Package dependencies
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

### Domain Structure

Each domain follows a consistent structure:

```
domains/user/
├── user.schema.ts       # Database schema with Drizzle
├── user.model.ts        # TypeScript entity models
├── user.dto.ts          # Data Transfer Objects with Zod
├── user.repository.ts   # Data access layer
├── user.service.ts      # Business logic
├── user.controller.ts   # API endpoints/routes
├── user.middleware.ts   # Domain-specific middleware
├── *.spec.ts            # Unit tests
└── *.test.ts            # Integration tests
```

## Architecture

This project follows a clean, layered architecture using dependency injection:

1. **Controller Layer**: HTTP request handling, validation, and response formatting
2. **Service Layer**: Business logic, coordinating between repositories
3. **Repository Layer**: Data access, CRUD operations
4. **Entity Layer**: Domain models and types

### Key Architectural Patterns

- **Dependency Injection**: Using TypeDI for loose coupling
- **Repository Pattern**: Abstracting data access
- **DTOs**: Validating input/output with Zod
- **Middleware**: Cross-cutting concerns

## Database & ORM

### Database Schema

The system uses a multi-tenant RBAC model with the following key entities:

- **Users**: People who can access the system

  - Contains profile information (first/last name, email, username)
  - Supports preferred language settings
  - Tracks account status (enabled/disabled)
  - Has global admin capability for system-wide access

- **Tenants**: Organizations or logical groups

  - Can be designated as default for new users
  - Contains optional description for tenant info
  - Supports soft deletion for tenant deprecation

- **Roles**: Named collections of permissions within tenants

  - Scoped to specific tenants
  - Enforces unique role names within each tenant
  - Supports hierarchical permissions

- **Permissions**: Granular access controls

  - System-wide permissions that can be assigned to roles
  - Grouped by categories for easier management
  - Contains descriptions for better clarity

- **UserTenantRoles**: Junction table associating users with roles in tenants
  - Allows users to have different roles in different tenants
  - Implements many-to-many-to-many relationship
- **RolePermissions**: Junction table associating roles with permissions
  - Implements many-to-many relationship between roles and permissions

All entities use UUID primary keys for security and support soft deletion via `deletedAt` timestamp. Foreign keys use `onDelete: 'cascade'` behavior to maintain referential integrity.

#### Entity Relationship Diagram

![ERD Diagram](https://raw.githubusercontent.com/chen7david/entix-api/7a42d17c0cb8b444552790d3902488d9d542b3d0/docs/assets/erd-multi-tenancy-rbac.svg)

### Drizzle ORM

We use [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access:

- **Schema Files**: Located in each domain (e.g., `src/domains/user/user.schema.ts`)
- **Migrations**: Generated and tracked in `/src/database/migrations`
- **Type Safety**: Full TypeScript integration
- **Relations**: Defined with Drizzle's relation system for type-safe joins
- **Indexes**: Optimized with appropriate indexes on commonly queried fields
- **Constraints**: Enforced at database level (unique constraints, foreign keys)

### Database Management

```bash
# Push schema changes to dev database
npm run db:push

# Push schema changes to test database
NODE_ENV=test npm run db:push

# Generate a new migration
npm run db:generate -- --name=migration_name

# Apply migrations
npm run db:migrate

# Visualize database in web UI
npm run db:studio
```

## API Documentation

### OpenAPI

The API automatically generates OpenAPI 3.0 documentation:

- **Live Spec**: http://localhost:3000/openapi.json
- **Schemas**: Generated from Zod validation schemas
- **Endpoints**: Documented with routing-controllers-openapi

### Using with Postman

1. Open Postman
2. Click "Import" > "Link"
3. Paste your running server's `/openapi.json` URL
4. Postman will generate a complete collection

### Documentation Guide

See [API Documentation Guide](./docs/api-documentation.md) for best practices on:

- Annotating endpoints
- Adding examples
- Documenting responses
- Schema organization

## Testing

### Test Types

- **Unit Tests** (`.spec.ts`): Test individual components in isolation
- **Integration Tests** (`.test.ts`): Test multiple components together
- **E2E Tests** (`.e2e.ts`): Test complete workflows (not required at this stage)

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/file.test.ts

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### Testing Guidelines

See [Testing Guide](./docs/testing.md) for comprehensive information on:

- Using TypeDI in tests
- Test isolation
- Mocking strategies
- Transaction management
- Test naming conventions

## Security

### Features

- **Authentication**: AWS Cognito integration
- **Authorization**: Role-Based Access Control (RBAC)
- **Multi-Tenancy**: Data isolation between tenants
- **Input Validation**: All requests validated with Zod
- **Rate Limiting**: Configurable per endpoint
- **Headers**: Secure HTTP headers with Helmet
- **CORS**: Configurable origin restrictions
- **UUIDs**: Non-sequential IDs to prevent enumeration
- **Error Handling**: Sanitized error messages

### Configuration

Security settings are configured via environment variables:

```dotenv
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # 100 requests per window

# CORS
CORS_ORIGIN=*                # Set to specific origin in production

# Node environment
NODE_ENV=development         # Set to 'production' in production
```

For detailed security configuration, see [API Security Guide](./docs/api-security.md).

## Development Workflow

### Branching Strategy

Use the following naming convention for branches:

```
<type>/<jira-ticket>-<short-description>
```

Examples:

- `feat/ENTIX-123-add-user-profile-endpoint`
- `fix/ENTIX-456-fix-auth-validation`
- `refactor/ENTIX-789-improve-error-handling`

### Code Quality

Code quality is enforced via:

- **ESLint**: Static code analysis
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Test coverage requirements

Run quality checks:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Adding a New Feature

1. Create a new branch
2. Implement the feature with tests
3. Update documentation if needed
4. Submit a pull request
5. Address review feedback
6. Merge after approval

## Deployment

### Docker

The project includes Docker configuration for containerized deployment:

```bash
# Build the Docker image
docker build -t entix-api .

# Run the container
docker run -p 3000:3000 --env-file .env entix-api
```

### CI/CD Pipeline

Our CI/CD pipeline uses:

- **GitHub Actions**: For PR checks and builds
- **Docker**: For containerized deployments
- **Jenkins**: For production/staging deploys

See [CI/CD Guide](./docs/ci-cd.md) for detailed pipeline information.

## Documentation

For more detailed documentation, see:

- [CI/CD Guide](./docs/ci-cd.md)
- [Logger Usage](./docs/logger-usage.md)
- [Request Validation](./docs/request-validation.md)
- [Testing Guide](./docs/testing.md)
- [Path Aliasing Setup](./docs/path-aliasing-setup.md)
- [ESLint & Prettier Setup](./docs/eslint-prettier-setup.md)
- [Express + TypeDI Setup](./docs/express-typedi-setup.md)
- [Error Handling](./docs/error-handling.md)
- [Database Migrations](./docs/db-migrations.md)
- [Implementation Tips](./docs/implementation-tips.md)

## Recent Updates

### User Schema Updates (May 2025)

- Changed user IDs from numeric to UUIDs for better security and scalability
- Added `username` as a unique identifier
- Added `cognitoSub` for AWS Cognito integration
- Replaced `isActive` with `isDisabled` (reversed logic, default false)
- Added `isAdmin` flag for global admins
- Added `updatedAt` timestamp field

To apply these changes:

```bash
npm run db:push
```

For existing installations, a migration script is available at:

```
src/database/migrations/0001_update_users_schema.sql
```

## Troubleshooting

### Common Issues

- **Database connection errors**: Check your `.env` file for correct database credentials
- **Dev Container issues**: Ensure Docker is running and VSCode Dev Containers extension is installed
- **Type errors**: Run `npm install` to ensure all dependencies are updated
- **Migration errors**: Check your database schema for conflicts

### Getting Help

If you encounter issues:

1. Check documentation in the `docs/` folder
2. Review the issue tracker for similar problems
3. Open a new issue with detailed reproduction steps

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation as needed
6. Submit a pull request

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

If you have questions, suggestions, or want to contribute, please open an issue or pull request!
