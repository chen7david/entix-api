# entix-api

## Environment Variables Management

This project uses environment variables for configuration across different environments:
- Development: `.env` file
- CI: GitHub Actions secrets
- Production: Jenkins secrets

### Adding or Updating Environment Variables

When adding or modifying environment variables, follow these steps:

1. **Update Schema**
   - Add the new variable to the environment schema in `src/config/env.config.ts`
   - Specify type, validation rules, and default value (if applicable)
   ```typescript
   export const envSchema = z.object({
     NEW_VAR: z.string(),
     OPTIONAL_VAR: z.string().optional(),
     PORT: z.coerce.number().default(3000)
   });
   ```

2. **Development Environment**
   - Add the variable to `.env` with a development-appropriate value
   - Add the variable to `.env.example` with a placeholder value
   - Update `.env.test` if needed for test environment

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
   - Delete the secret from GitHub Actions
   - Remove from Jenkins configuration

### Best Practices

- Never commit sensitive values to version control
- Always update `.env.example` when adding new variables
- Use descriptive names in UPPER_SNAKE_CASE
- Group related variables with common prefixes
- Add comments in `.env.example` to explain variable purpose
- Consider adding validation rules for critical variables