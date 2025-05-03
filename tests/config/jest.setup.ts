/**
 * Jest setup file for entix-api.
 * This file runs before all tests are executed.
 * It sets up the test database by running the db:push-test command.
 */

import { execSync } from 'child_process';

// Run the db:push-test command to set up the test database schema
beforeAll(async () => {
  console.log('Setting up test database schema...');
  try {
    // Execute the npm run db:push-test command
    execSync('npm run db:push-test', {
      stdio: 'inherit', // Forward the command's output to the console
    });
    console.log('Test database schema set up successfully.');
  } catch (error) {
    console.error('Failed to set up test database schema:', error);
    // This will cause Jest to fail if the database setup fails
    throw error;
  }
});

// You can add other global test setup logic here if needed
