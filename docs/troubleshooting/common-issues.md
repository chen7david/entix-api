---
title: Common Issues
---

# Common Issues

This guide addresses common issues you might encounter when working with the Entix API and provides solutions to resolve them.

## Development Environment Issues

### Installation Problems

#### Node.js Version Mismatch

**Issue**: Error messages about incompatible Node.js version.

**Solution**: Ensure you're using Node.js 18.19.0 or later.

```bash
# Check your Node.js version
node -v

# If needed, install the correct version using nvm
nvm install 18.19.0
nvm use 18.19.0
```

#### Package Installation Failures

**Issue**: `npm install` fails with dependency errors.

**Solution**:

1. Delete `node_modules` folder and `package-lock.json`
2. Clear npm cache
3. Reinstall dependencies

```bash
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

### Environment Configuration

#### Missing Environment Variables

**Issue**: Application fails with errors about missing environment variables.

**Solution**:

1. Ensure you have a `.env` file in the project root
2. Check that all required variables are defined based on `.env.example`
3. Verify environment-specific files (`.env.development`, `.env.test`) as needed

#### Wrong Database Configuration

**Issue**: Unable to connect to the database.

**Solution**:

1. Verify database connection settings in your `.env` file
2. Ensure PostgreSQL is running
3. Check if the database exists

```bash
# Check if PostgreSQL is running
pg_isready

# Create the database if it doesn't exist
createdb entix_development
```

## Runtime Issues

### API Server Won't Start

#### Port Already in Use

**Issue**: Error message about the port already being in use.

**Solution**:

1. Find and kill the process using the port

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

2. Or, change the port in your `.env` file:

```
PORT=3001
```

#### TypeScript Compilation Errors

**Issue**: Build fails due to TypeScript errors.

**Solution**:

1. Check the error messages to identify problematic files
2. Fix type issues in your code
3. Ensure your TypeScript configuration is correct

```bash
# Run TypeScript compiler to see errors
npx tsc --noEmit
```

### Database Connection Issues

#### Connection Timeouts

**Issue**: Database connection timeouts during server startup.

**Solution**:

1. Verify the database server is running
2. Check network connectivity/firewall rules
3. Increase connection timeout in `db.config.ts`:

```typescript
const pool = new Pool({
  // ...other configs
  connectionTimeoutMillis: 10000,
});
```

#### Too Many Clients Error

**Issue**: "too many clients already" error message.

**Solution**:

1. Check for connection leaks in your code (always release clients)
2. Reduce the maximum pool size
3. Implement a connection release timeout

```typescript
const pool = new Pool({
  // ...other configs
  max: 10, // Reduce from default
  idleTimeoutMillis: 30000,
});
```

## Testing Issues

### Test Database Setup

#### Test Database Initialization Fails

**Issue**: Unable to set up test database for running tests.

**Solution**:

1. Make sure PostgreSQL is running
2. Check `.env.test` database configuration
3. Run the initialization script manually

```bash
NODE_ENV=test npm run test:init-db
```

### Test Failures

#### Inconsistent Test Results

**Issue**: Tests pass sometimes and fail other times.

**Solution**:

1. Look for race conditions or asynchronous code not properly awaited
2. Ensure test database is properly reset between tests
3. Add logging to identify intermittent issues

#### Timeout Errors in Tests

**Issue**: Tests fail with timeout errors.

**Solution**:

1. Increase the Jest timeout setting
2. Check for long-running operations
3. Ensure promises are being properly resolved

```typescript
// In jest.config.ts
export default {
  // ... other config
  testTimeout: 10000, // Increase to 10 seconds
};

// Or in specific test files
jest.setTimeout(10000);
```

## Deployment Issues

### Build Failures

#### Out of Memory During Build

**Issue**: Build process crashes with out of memory errors.

**Solution**:

1. Increase Node.js memory limit:

```bash
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

2. Optimize your build process
3. Break up large files

### Runtime Failures

#### API Crashes in Production

**Issue**: API frequently crashes in production.

**Solution**:

1. Implement proper error handling
2. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/server.js --name entix-api
```

3. Add monitoring and alerting
4. Enable crash reporting

#### Memory Leaks

**Issue**: API gradually uses more memory until it crashes.

**Solution**:

1. Monitor memory usage
2. Look for objects not being garbage collected
3. Check for event listeners not being removed
4. Review database connection management

## Performance Issues

### Slow API Responses

#### Database Query Performance

**Issue**: Specific API endpoints are very slow.

**Solution**:

1. Identify slow queries with monitoring or logging
2. Add indexes to frequently queried fields
3. Optimize complex queries
4. Implement query caching where appropriate

#### High CPU Usage

**Issue**: Server has high CPU usage under load.

**Solution**:

1. Profile your application to identify bottlenecks
2. Optimize computationally expensive operations
3. Implement caching for expensive calculations
4. Consider scaling horizontally

## Security Issues

### Authentication Problems

#### JWT Token Issues

**Issue**: Users get unexpectedly logged out or receive authentication errors.

**Solution**:

1. Check JWT token expiration settings
2. Verify clock synchronization between servers
3. Implement token refresh mechanism
4. Check for secure cookie settings

## Logging and Monitoring Issues

#### Missing Logs

**Issue**: Expected logs are not appearing in output.

**Solution**:

1. Check log level settings
2. Verify log transport configuration
3. Ensure log directory is writable

```
# .env configuration
LOG_LEVEL=debug
```

## Getting Additional Help

If you're experiencing an issue not covered in this guide:

1. **Check GitHub Issues**: Search the [GitHub repository issues](https://github.com/chen7david/entix-api/issues) to see if others have encountered the same problem.

2. **Ask for Help**: Create a new GitHub issue with detailed information about the problem, including:

   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Relevant logs
   - Environment details (Node.js version, OS, etc.)

3. **Debug Yourself**: Use the [Debugging Guide](/troubleshooting/debugging.md) for more advanced debugging techniques.
