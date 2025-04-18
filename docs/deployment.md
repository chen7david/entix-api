# Deployment Guide

This guide covers how to build and deploy the application to production environments.

[← Back to README](../README.md)

## Prerequisites

Before deploying, ensure you have:

1. Node.js (LTS version recommended)
2. npm or yarn
3. Access to your production environment (server, cloud platform, etc.)
4. Proper environment variables set up for production

## Building for Production

The application needs to be compiled from TypeScript to JavaScript before it can run in production. Use the following command to build the application:

```bash
npm run build
```

This command:

1. Cleans the `dist` directory using `rimraf`
2. Compiles TypeScript to JavaScript with production settings
3. Resolves path aliases to ensure proper module resolution

## Running in Production

After building, you can start the application in production mode:

```bash
npm start
```

This command:

1. Sets `NODE_ENV=prod` using cross-env
2. Runs the compiled JavaScript from the `dist` directory
3. Uses production-optimized settings

## Production Scripts

The following npm scripts are available for production:

| Script  | Command                                                                         | Description                             |
| ------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| `build` | `rimraf dist && tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json` | Builds the application for production   |
| `start` | `cross-env NODE_ENV=prod node dist/server.js`                                   | Runs the application in production mode |

## Environment Variables

Make sure to set up these environment variables in your production environment:

```
PORT=3000 # The port to run the server on
# Add other production-specific environment variables
```

## Docker Deployment (Optional)

If using Docker, you can build and run the application using:

```bash
# Build the Docker image
docker build -t entix-api .

# Run the container
docker run -p 3000:3000 -e PORT=3000 entix-api
```

## Continuous Integration/Deployment

### GitHub Actions

This project includes a GitHub Actions workflow that automatically runs tests and builds the application on pull requests to the `genesis-v1` branch and when changes are merged into that branch.

The workflow is defined in `.github/workflows/ci.yml` and performs the following steps:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Creates necessary environment files
5. Runs linting checks
6. Runs tests
7. Builds the application
8. Verifies the build output

To see the status of your workflow runs, go to the "Actions" tab in your GitHub repository.

### Setting Up Your Own CI/CD Pipeline

For CI/CD pipelines outside of GitHub Actions, a typical workflow would be:

1. Run tests: `npm test`
2. Build the application: `npm run build`
3. Deploy to hosting environment
4. Start the application: `npm start`

## Production Best Practices

1. **Process Management**: Use a process manager like PM2 to keep your application running:

   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name entix-api
   ```

2. **Logging**: Configure proper logging for production, avoiding console logs in favor of structured logging.

3. **Error Handling**: Ensure all errors are properly caught and handled. The `ServerService` includes built-in error handling.

4. **Monitoring**: Add monitoring to track application health and performance.

## Related Documentation

- [Server Service](./server-service.md)
- [AppService](./app-service.md)
- [Environment Loader](./setup-env-loader.md)
- [GitHub Actions](./github-actions.md)
