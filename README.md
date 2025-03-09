# entix-api

## Getting Started

### Prerequisites

Before opening the project in Dev Containers, make sure you have:

1. Docker installed and running
2. VS Code with Dev Containers extension
3. A `.env` file in the root directory with the following database configuration:

```env
DB_NAME=entix-api    # Your preferred database name
DB_USER=dbUser       # Your preferred database user
DB_PASSWORD=dbPassword # Your preferred database password
```

These values will be used to create the PostgreSQL database and user when the container starts. If you don't set these values before opening in Dev Containers, the default values shown above will be used.

### Important Note

If you accidentally opened the container without setting the proper values in `.env`:

1. Close the Dev Container
2. Delete the Docker volume to remove the database
3. Create/update your `.env` file with your preferred values
4. Reopen in Dev Containers

## Test Environment Setup

The project includes automated setup for the test environment:

1. **Initialize Test Environment**

   ```bash
   npm run test:init
   ```

   This command:

   - Creates a `.env.test` file based on your `.env` file
   - Appends `-test` to the database name in `.env.test`
   - Creates or recreates the test database

2. **Safety Features**

   - The test database initialization will only work if the database name contains `-test`
   - This prevents accidental deletion of non-test databases
   - If the test database already exists, it will be dropped and recreated

3. **Running Tests**
   ```bash
   npm test
   ```
   Tests automatically use the test database configuration from `.env.test`

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
