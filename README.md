# entix-api

## Table of Contents

- [Getting Started](#getting-started)
  - [Development Environment Setup](#development-environment-setup)
  - [Manual Setup (Without Dev Containers)](#manual-setup-without-dev-containers)
- [Test Environment](#test-environment)
- [Environment Variables Management](#environment-variables-management)
- [Development Workflow](#development-workflow)
- [Cleanup and Troubleshooting](#cleanup-and-troubleshooting)

## Getting Started

### Development Environment Setup

#### Using Dev Containers (Recommended)

This project is configured to use VS Code Dev Containers, which provides a consistent development environment with all dependencies pre-configured.

**Prerequisites:**

1. Docker installed and running
2. VS Code with Dev Containers extension
3. A `.env` file in the root directory (see below)

**Setup Steps:**

1. Copy `.env.example` to `.env` (will be done automatically if not present)
2. Open the project in VS Code
3. When prompted, click "Reopen in Container"
4. The container will automatically:
   - Install all npm dependencies
   - Set up the PostgreSQL database
   - Create a test environment configuration

**Dev Container Features:**

- Node.js environment with all dependencies
- PostgreSQL database
- Git and GitHub CLI
- ESLint and Prettier configured
- Port forwarding for the API (3000) and PostgreSQL (5432)

### Manual Setup (Without Dev Containers)

If you prefer not to use Dev Containers, you'll need to set up the environment manually:

1. Install Node.js (version specified in package.json)
2. Install PostgreSQL 13 or later
3. Copy `.env.example` to `.env` and update the values
4. Run the following commands:
   ```bash
   npm install
   npm run test:init  # Sets up test environment
   ```
5. Configure your PostgreSQL database according to your `.env` settings

## Test Environment

The project includes automated setup for the test environment:

1. **Initialize Test Environment**

   ```bash
   npm run test:init
   ```

   This command:

   - Creates a `.env.test` file based on your `.env` file (if it doesn't exist)
   - Appends `-test` to the database name in `.env.test`
   - Creates or recreates the test database

2. **Safety Features**

   - The test database initialization will only work if the database name contains `-test`
   - This prevents accidental deletion of non-test databases
   - If the test database already exists, it will be dropped and recreated

3. **Running Tests**
   ```bash
   npm test               # Run all tests
   npm run test:watch     # Run tests in watch mode
   npm run test:coverage  # Run tests with coverage report
   ```

If you prefer not to use Dev Containers, you'll need to set up the environment manually:

1. Install Node.js (version specified in package.json)
2. Install PostgreSQL 13 or later
3. Copy `.env.example` to `.env` and update the values
4. Run the following commands:
   ```bash
   npm install
   npm run test:init  # Sets up test environment
   ```
5. Configure your PostgreSQL database according to your `.env` settings

## Test Environment

The project includes automated setup for the test environment:

1. **Initialize Test Environment**

   ```bash
   npm run test:init
   ```

   This command:

   - Creates a `.env.test` file based on your `.env` file (if it doesn't exist)
   - Appends `-test` to the database name in `.env.test`
   - Creates or recreates the test database

2. **Safety Features**

   - The test database initialization will only work if the database name contains `-test`
   - This prevents accidental deletion of non-test databases
   - If the test database already exists, it will be dropped and recreated

3. **Running Tests**
   ```bash
   npm test               # Run all tests
   npm run test:watch     # Run tests in watch mode
   npm run test:coverage  # Run tests with coverage report
   ```

## Environment Variables Management

This project uses environment variables for configuration across different environments:

- Development: `.env` file
- Testing: `.env.test` file (created by `npm run test:init`)
- CI: GitHub Actions secrets
- Production: Jenkins secrets
- Docker: Uses `.env` with fallback to defaults in docker-compose.yml

### Adding or Updating Environment Variables

When adding or modifying environment variables, follow these steps:

1. **Update Schema**

   - Add the new variable to the environment schema in `src/config/env.config.ts`
   - Specify type, validation rules, and default value (if applicable)

   ```typescript
   export const envSchema = z.object({
     NEW_VAR: z.string(),
     OPTIONAL_VAR: z.string().optional(),
     PORT: z.coerce.number().default(3000),
   });
   ```

2. **Development Environment**

   - Add the variable to `.env` with a development-appropriate value
   - Add the variable to `.env.example` with a placeholder value
   - Update `.env.test` if needed for test environment
   - If the variable is needed in Docker containers:
     - Add to `.devcontainer/docker-compose.yml` with a default value
     - Use the syntax: `${VAR_NAME:-default_value}`

3. **CI/CD Pipeline**

   - Add the secret in GitHub Actions
     - Go to Repository Settings → Secrets → Actions
     - Add New Repository Secret
     - Use the exact same name as in the schema

4. **Production Environment**
   - Add the secret in Jenkins
     - Navigate to the job configuration
     - Add the variable under "Build Environment" → "Inject passwords"
     - Use the exact same name as in the schema

### Removing Environment Variables

1. **Remove from Schema**

   - Delete the variable from `src/config/env.config.ts`
   - Update any TypeScript types that reference it

2. **Clean Up Sources**
   - Remove from `.env` and `.env.example`
   - Remove from `.env.test` if present
   - Remove from `.devcontainer/docker-compose.yml` if present
   - Delete the secret from GitHub Actions
   - Remove from Jenkins configuration

### Best Practices

- Never commit sensitive values to version control
- Always update `.env.example` when adding new variables
- Use descriptive names in UPPER_SNAKE_CASE
- Group related variables with common prefixes
- Add comments in `.env.example` to explain variable purpose
- Add validation rules for critical variables
- For Docker, always provide sensible defaults in docker-compose.yml

## Development Workflow

### Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the production version
- `npm start` - Run the production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:init` - Initialize the test environment

### Database Management

The project uses PostgreSQL for data storage. When running in Dev Containers:

- The database is automatically created based on your `.env` configuration
- The test database is created with `-test` appended to the database name
- Database data is persisted in a Docker volume

## Cleanup and Troubleshooting

### Complete Dev Environment Cleanup

If you need to completely reset your development environment, use the following command to remove all containers and volumes:

```bash
docker stop entix-api-devcontainer entix-api-db-devcontainer \
&& docker rm entix-api-devcontainer entix-api-db-devcontainer \
&& docker volume rm entix-api-node_modules \
&& docker volume rm entix-api-postgres \
&& docker volume rm vscode
```

**Warning:** This will delete all database data and node_modules. Use only when you want to completely reset your environment.

### Common Issues

1. **Database Connection Issues**

   - Check that PostgreSQL is running
   - Verify your `.env` database configuration
   - For Dev Containers, try rebuilding the container

2. **Missing Environment Variables**

   - Ensure your `.env` file is properly configured
   - Check that all required variables are defined in the schema

3. **Dev Container Not Starting**
   - Check Docker is running
   - Look for errors in the VS Code Dev Containers output
   - Try the cleanup command above and restart
