# GitHub Actions Configuration

This document provides information about the GitHub Actions setup for continuous integration and deployment in this project.

[← Back to README](../README.md)

## Overview

GitHub Actions is used to automate testing and building processes when:

- Pull requests are created targeting the `genesis-v1` branch
- Changes are merged into the `genesis-v1` branch

## Workflow Configuration

The workflow is defined in `.github/workflows/ci.yml` and performs several key tasks to ensure code quality and functionality.

### Trigger Events

```yaml
on:
  push:
    branches: [genesis-v1]
  pull_request:
    branches: [genesis-v1]
```

This configuration triggers the workflow when:

- Code is pushed to the `genesis-v1` branch
- Pull requests are created or updated targeting the `genesis-v1` branch

### Jobs

The workflow consists of two main jobs:

#### 1. Build and Test

This job performs the following steps:

1. **Checkout code**: Retrieves the latest code from the repository
2. **Setup Node.js**: Configures the Node.js environment (uses v18.x)
3. **Install dependencies**: Runs `npm ci` to install dependencies exactly as specified in package-lock.json
4. **Setup environment files**: Creates necessary .env files for testing and building
5. **Lint check**: Verifies code style using ESLint
6. **Run tests**: Executes the test suite with Jest
7. **Build**: Compiles the TypeScript code to JavaScript
8. **Verify build**: Checks that the build output exists and contains the necessary files

#### 2. Notify

This job runs after the build-and-test job completes, regardless of its outcome, and:

- Reports success when all tests pass
- Reports failure when any part of the process fails

## Environment Configuration

The workflow automatically creates the required environment files:

```bash
# .env.test for testing
NODE_ENV=test
PORT=3000

# .env for building
NODE_ENV=prod
PORT=3000
```

These files ensure that:

- Tests run in the proper environment
- The build process has the necessary configuration
- Our environment validator doesn't throw errors due to missing variables

## Customizing the Workflow

To customize the GitHub Actions workflow:

1. Edit the `.github/workflows/ci.yml` file
2. Modify the trigger events to target different branches
3. Add additional steps or jobs as needed
4. Customize environment variables to match your project requirements

## Best Practices

When working with this GitHub Actions workflow:

1. **Always run tests locally** before pushing to avoid failed CI checks
2. **Check the Actions tab** in GitHub after pushing to monitor workflow progress
3. **Fix failed workflows promptly** to maintain a working codebase
4. **Add new environment variables** to the workflow file when they're required by your application

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Environment Loader](./setup-env-loader.md)
- [Testing Setup](./setup-jest.md)
