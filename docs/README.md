# EntixAPI Documentation

This directory contains the documentation for EntixAPI, a scalable REST API built with Express, TypeScript, and TypeDI.

## Documentation Structure

The documentation is organized by topic:

- **Core Services**

  - [AppService](./app-service.md) - Express application setup and configuration
  - [ServerService](./server-service.md) - HTTP server management and lifecycle
  - [Environment Service](./setup-env-loader.md) - Environment variable loading and validation

- **Architecture**

  - [Dependency Injection](./dependency-injection.md) - How to use TypeDI in the application
  - [Error Handling](./error-handling.md) - Error handling patterns and utilities

- **Project Setup**

  - [ESLint Configuration](./setup-eslint.md)
  - [Prettier Configuration](./setup-prettier.md)
  - [TypeScript Configuration](./setup-typescript.md)
  - [Jest Setup](./setup-jest.md)
  - [Path Aliases](./setup-path-aliases.md)

- **Testing**

  - [Environment Service Testing](./setup-env-loader-testing.md) - Testing strategies for EnvService

- **DevOps**
  - [Deployment](./deployment.md) - Deployment instructions and best practices
  - [GitHub Actions](./github-actions.md) - CI/CD workflow

## Recent Updates

- **Environment Service**: The `EnvLoader` has been replaced with an injectable `EnvService` for better dependency injection and testability. See [Environment Service](./setup-env-loader.md) for details.
- **Dependency Injection**: The documentation has been updated to reflect best practices for using TypeDI with injectable services.

## How to Contribute to Documentation

1. Follow the same format as existing documentation
2. Use markdown for all documentation
3. Include code examples with proper syntax highlighting
4. Reference related documentation where appropriate
5. Include a "References" section at the end

## References

- [TypeDI Documentation](https://github.com/typestack/typedi)
- [Express Documentation](https://expressjs.com/)
- [routing-controllers](https://github.com/typestack/routing-controllers)
