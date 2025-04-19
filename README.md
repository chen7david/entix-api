# Express App with TypeScript

This repository serves as a foundational project for building an Express application from scratch using TypeScript. The development process is iterative, focusing on implementing and explaining best practices at each stage.

## Project Overview

We have set up the base project structure and defined the necessary packages in the `package.json` file. The following scripts have been created to facilitate development:

- **`dev`**: Runs TypeScript files directly using `ts-node`.
- **`test`**: Runs tests using Jest with TypeScript support.
- **`build`**: Compiles TypeScript to JavaScript and rewrites path aliases for production.
- **`start`**: Runs the compiled application in production mode.

### Configuration Management

We use a base TypeScript configuration (`tsconfig.base.json`) to centralize common settings. Other configs (for build, test, etc.) extend from this base, ensuring consistency and maintainability. See the documentation below for details.

- [TypeScript Setup](docs/setup-typescript.md)
- [Jest Setup](docs/setup-jest.md)
- [Path Aliases Setup](docs/setup-path-aliases.md)
- [How to Add a Path Alias](docs/add-path-alias.md)
- [Prettier Configuration](docs/setup-prettier.md)
- [ESLint Configuration](docs/setup-eslint.md)
- [Environment Service](docs/setup-env-loader.md)

### Prettier & ESLint

This project uses Prettier and ESLint together for code formatting and linting. See [Prettier Configuration](docs/setup-prettier.md) and [ESLint Configuration](docs/setup-eslint.md) for details.

### Path Aliases

Path aliases (e.g., `@src/*`) are configured for cleaner imports. We use `tsc-alias` and `tsconfig-paths` to support these aliases at build and runtime.

### Testing

Jest is configured for TypeScript, with type definitions registered in the appropriate `tsconfig` files to ensure editor and build-time support for Jest globals.

### Continuous Integration

The project uses GitHub Actions for continuous integration, automatically running tests and building the application on pull requests to and merges into the `genesis-v1` branch. See the [Deployment Guide](docs/deployment.md#github-actions) for details.

### Deployment

For production deployment, follow these steps:

1. Build the application: `npm run build`
2. Run in production: `npm start`

See the [Deployment Guide](docs/deployment.md) for detailed instructions.

## Links

- [TypeScript Setup](docs/setup-typescript.md)
- [Jest Setup](docs/setup-jest.md)
- [Path Aliases Setup](docs/setup-path-aliases.md)
- [How to Add a Path Alias](docs/add-path-alias.md)
- [Prettier Configuration](docs/setup-prettier.md)
- [ESLint Configuration](docs/setup-eslint.md)
- [Environment Service](docs/setup-env-loader.md)
- [Environment Loader Testing](docs/setup-env-loader-testing.md)
- [AppService](docs/app-service.md)
- [Deployment Guide](docs/deployment.md)
- [GitHub Actions](docs/github-actions.md)
- [Error Handling](docs/error-handling.md)
- [Dependency Injection](docs/dependency-injection.md)

### Purpose of the Repository

This repository aims to serve as a base for collaborating and applying industry best practices within reasonable limits. By following a structured approach, we ensure that our code is clean, maintainable, and scalable, making it easier for developers to contribute and understand the project.

We invite you to explore the code, contribute, and learn about the best practices in TypeScript and Express development.

## Documentation

For detailed documentation on specific components:

- [Server Service](docs/server-service.md) - HTTP server management and lifecycle
- [AppService](docs/app-service.md) - Express application setup with routing-controllers
- [Deployment Guide](docs/deployment.md) - Building and running in production
- [Error Handling](docs/error-handling.md) - Comprehensive error management system
- [Dependency Injection](docs/dependency-injection.md) - TypeDI usage and best practices
