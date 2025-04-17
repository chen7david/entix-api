# Express App with TypeScript

This repository serves as a foundational project for building an Express application from scratch using TypeScript. The development process is iterative, focusing on implementing and explaining best practices at each stage.

## Project Overview

We have set up the base project structure and defined the necessary packages in the `package.json` file. The following scripts have been created to facilitate development:

- **`dev`**: Runs TypeScript files directly using `ts-node`.
- **`test`**: Runs tests using Jest with TypeScript support.
- **`build`**: Compiles TypeScript to JavaScript and rewrites path aliases for production.

### Configuration Management

We use a base TypeScript configuration (`tsconfig.base.json`) to centralize common settings. Other configs (for build, test, etc.) extend from this base, ensuring consistency and maintainability. See the documentation below for details.

### Path Aliases

Path aliases (e.g., `@src/*`) are configured for cleaner imports. We use `tsc-alias` and `tsconfig-paths` to support these aliases at build and runtime.

### Testing

Jest is configured for TypeScript, with type definitions registered in the appropriate `tsconfig` files to ensure editor and build-time support for Jest globals.

## Links

- [TypeScript Setup](docs/setup-typescript.md)
- [Jest Setup](docs/setup-jest.md)
- [Path Aliases Setup](docs/setup-path-aliases.md)

### Purpose of the Repository

This repository aims to serve as a base for collaborating and applying industry best practices within reasonable limits. By following a structured approach, we ensure that our code is clean, maintainable, and scalable, making it easier for developers to contribute and understand the project.

We invite you to explore the code, contribute, and learn about the best practices in TypeScript and Express development.
