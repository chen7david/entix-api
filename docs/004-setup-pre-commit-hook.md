# Setting Up Pre-Commit Hooks with Husky

This document outlines the steps to set up pre-commit hooks using Husky in your project. Pre-commit hooks allow you to run scripts automatically before a commit is finalized, ensuring that your code meets certain standards.

## 1. Why Use Husky?

Husky is a tool that enables Git hooks, allowing you to run scripts at specific points in the Git workflow, such as before commits. This helps maintain code quality by enforcing checks like linting, formatting, and running tests before code is committed to the repository.

## 2. Installation

To set up Husky in your project, you need to install it as a development dependency. Run the following command:

```bash
npm install -D husky
```

## 3. Enabling Husky

After installing Husky, you need to enable Git hooks by running:

```bash
npx husky install
```

This command creates a `.husky` directory in your project root, where Husky will store its hooks.

## 4. Adding a Pre-Commit Hook

To add a pre-commit hook that runs specific commands (like linting and formatting), you can use the following command:

```bash
npx husky add .husky/pre-commit "npm run lint && npm run format"
```

This command creates a `pre-commit` file in the `.husky` directory and adds the specified commands to run before each commit.

## 5. Setting Up the `prepare` Script

In your `package.json`, you should ensure that the `prepare` script is set up to run the `install.mjs` script. This ensures that Husky is installed automatically when someone clones your repository.

Your `package.json` should include the following:

```json
{
  "scripts": {
    "prepare": "node .husky/install.mjs"
  }
}
```

### Why We Need the `prepare` Script

The `prepare` script is executed automatically when you run `npm install`. It ensures that Husky is set up correctly, allowing the hooks to function as intended. This is particularly useful for new team members or when the repository is cloned to a new environment.

## 6. Handling Husky in Production

Since Husky is a development dependency, it will not be installed in production environments if you run `npm install --production`. This is important because you want to avoid running pre-commit hooks in production, where they are not needed.

To ensure that Husky does not interfere in production, you can:

- Use the `--production` flag when deploying your application to skip installing dev dependencies.
- Make sure your CI/CD pipeline does not rely on Husky hooks unless explicitly needed for testing or staging environments.

### Skipping Husky Installation in Production and CI

To prevent Husky from being installed in production or CI environments, you can create an `install.mjs` script with the following content:

```javascript
// .husky/install.mjs
// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0);
}
const husky = (await import('husky')).default;
console.log(husky());
```

This script checks the environment and exits without installing Husky if it detects that the environment is production or CI.

## 7. Conclusion

By following these steps, you can effectively set up pre-commit hooks using Husky in your project. This helps maintain code quality and consistency, ensuring that your code meets the required standards before being committed to the repository. If you have any further questions or need additional assistance, feel free to ask!
