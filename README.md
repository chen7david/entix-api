# Entix API

## Overview

The **Entix API** is a Node.js application designed for monitoring and logging using [New Relic](https://newrelic.com/) and [Pino](https://getpino.io/). This API is built with TypeScript and follows modern development practices to ensure maintainability and scalability.

## Technology Stack

- **Node.js**: JavaScript runtime for building server-side applications.
- **TypeScript**: A superset of JavaScript that adds static types.
- **New Relic**: A monitoring tool for performance management and observability.
- **Pino**: A fast logger for Node.js applications.
- **PostgreSQL**: A relational database used for data storage.
- **Docker**: Containerization platform for packaging applications.
- **GitHub Actions**: CI/CD platform for automated builds and deployments.

## Scripts

The following scripts are available for managing the application:

- **`dev`**: Runs the application in development mode with hot reload on save.
- **`build`**: Compiles the TypeScript code to JavaScript and places it in a `dist` folder.
- **`format`**: Formats the TypeScript code according to the Prettier configuration defined in the `.prettierrc` file.
- **`test`**: Runs tests using Jest in a test environment.
- **`test:watch`**: Runs tests in watch mode.
- **`test:coverage`**: Runs tests and generates a coverage report.

## Tools

### Development Setup

- **`tsconfig-paths`**: Maps path aliases to relative paths during runtime.
- **`tsc-alias`**: Maps path aliases to relative paths during build time.

### Getting Started - Dev Containers

#### Prerequisites

- **Docker**: Ensure Docker is installed on your machine.

Dev containers provide a simple setup for a development environment. This workspace includes a PostgreSQL database with the following default credentials:

- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `postgres`

To start the dev container on a Mac, hold down `Shift` + `Command` + `P`, then choose **Dev Containers: Rebuild Container**.

## Coding Conventions

### Enums

We use uppercase for the keys in enums to semantically convey that they are constants and their values cannot be changed.

```typescript
enum ExampleEnum {
  SOME_KEY = 'some-value',
  SOME_OTHER_KEY = 'some-other-value',
}
```

### Types

We prefer using types instead of interfaces where possible. Types offer more flexibility, and we generally do not encourage declaration merging for readability and maintainability reasons.

## Deployment

The application is containerized using Docker and automatically built and published to GitHub Container Registry (GHCR) when code is merged into the `main` branch. For more details on the CI/CD pipeline, see the [CI/CD documentation](docs/ci-cd.md).

### Docker Image

You can pull the latest Docker image using:

```bash
docker pull ghcr.io/chen7david/entix-api:latest
```

To run the Docker image:

```bash
docker run -p 3000:3000 --env-file .env.production ghcr.io/chen7david/entix-api:latest
```

## New Relic Integration

For detailed information on how to integrate and configure New Relic, please refer to the [New Relic Integration Documentation](docs/newrelic.md).

## Additional Documentation

- [New Relic Integration](docs/newrelic.md)
- [CI/CD Pipeline](docs/ci-cd.md)
- [Logging with Pino](docs/logging.md) (if applicable)
- [API Endpoints](docs/api.md) (if applicable)

## Troubleshooting

If you encounter issues, check the following:

1. **Agent Logs**: Look for a `newrelic_agent.log` file in the project root directory.
2. **License Key**: Ensure your New Relic license key is correct in the environment variables.
3. **Network Access**: The New Relic agent needs outbound internet access to send data to New Relic.
4. **Node.js Version**: Ensure you're using a version of Node.js that's supported by the New Relic agent.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. Ensure that your code adheres to the coding conventions outlined above.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
