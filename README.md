# entix-api

A modern Express.js API with TypeScript, routing-controllers, and dependency injection.

## Quick Start

```bash
# Development with Docker (Recommended)
docker compose up

# Manual Setup
npm install
npm run dev
```

## Documentation

The full documentation for the Entix API can be viewed at [https://api-docs.entix.org](https://api-docs.entix.org).

### Local Documentation Development

To work on the documentation locally:

```bash
# Install dependencies
npm install

# Start documentation development server
npm run docs:dev

# Build documentation
npm run docs:build
```

Visit `http://localhost:8080` to preview the documentation.

## Documentation Structure

- [Setup Guide](docs/setup/README.md)

  - [Development Environment](docs/setup/development.md)
  - [Database Configuration](docs/setup/database.md)
  - [Environment Variables](docs/setup/environment.md)

- [Usage Guide](docs/usage/README.md)

  - [Dependency Injection](docs/usage/dependency-injection.md)
  - [Controllers](docs/usage/controllers.md)
  - [Middleware](docs/usage/middleware.md)

- [API Documentation](docs/api/README.md)

  - [Authentication](docs/api/authentication.md)
  - [Error Handling](docs/api/error-handling.md)
  - [Response Format](docs/api/response-format.md)

- [Contributing](docs/contributing/README.md)

  - [Development Workflow](docs/contributing/workflow.md)
  - [Documentation](docs/contributing/documentation.md)
  - [Code Style](docs/contributing/code-style.md)
  - [Testing](docs/contributing/testing.md)

- [FAQ](docs/faq/README.md)
  - [Common Issues](docs/faq/common-issues.md)
  - [Troubleshooting](docs/faq/troubleshooting.md)

## License

MIT
