# Setting Up Prettier and ESLint

This document outlines the steps to set up Prettier and ESLint in your project, along with an explanation of each package and best practices for maintaining code quality.

## Packages to Install

To set up Prettier and ESLint, you will need to install the following packages:

```bash
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint@^8.57.1 eslint-config-prettier eslint-plugin-jest eslint-plugin-prettier husky lint-staged
```

### Package Descriptions

1. **@typescript-eslint/eslint-plugin**: This package provides a set of ESLint rules specifically for TypeScript. It helps enforce best practices and catch common errors in TypeScript code.

2. **@typescript-eslint/parser**: This parser allows ESLint to understand TypeScript syntax. It converts TypeScript code into an AST (Abstract Syntax Tree) that ESLint can analyze.

3. **eslint**: The core ESLint package that provides the linting functionality. It analyzes your code for potential errors and enforces coding standards.

4. **eslint-config-prettier**: This package disables ESLint rules that conflict with Prettier. It ensures that both tools can work together without conflicts, allowing Prettier to handle code formatting.

5. **eslint-plugin-jest**: This plugin provides linting rules for Jest, a popular testing framework. It helps ensure that your tests follow best practices and are written correctly.

6. **eslint-plugin-prettier**: This plugin integrates Prettier into ESLint. It runs Prettier as an ESLint rule and reports any formatting issues as linting errors.

7. **husky**: A tool that enables Git hooks, allowing you to run scripts at certain points in the Git workflow, such as before commits.

8. **lint-staged**: A tool that runs linters on pre-committed files in Git, ensuring that only staged files are linted and formatted.

## Configuration

### ESLint Configuration

Create a file named `.eslintrc.cjs` in the root of your project and add the following configuration:

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'max-params': ['error', 2],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prettier/prettier': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['../*', './*'],
        paths: [
          {
            name: '..',
            message:
              'Use path aliases (e.g., @src/, @shared/, @domains/) instead of relative imports.',
          },
          {
            name: '.',
            message:
              'Use path aliases (e.g., @src/, @shared/, @domains/) instead of relative imports.',
          },
        ],
      },
    ],
    'jest/no-focused-tests': 'error',
    'jest/no-disabled-tests': 'error',
  },
  ignorePatterns: ['dist', 'node_modules'],
};
```

### Prettier Configuration

Create a file named `.prettierrc` in the root of your project and add your desired Prettier configuration. Here’s a basic example:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80,
  "tabWidth": 2
}
```

### Configuration for Husky and Lint-Staged

To integrate ESLint and Prettier into your pre-commit hooks, add the following configuration to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"]
  }
}
```

### Common ESLint Rules

Consider adding the following rules to your ESLint configuration for better type safety and code quality:

- `@typescript-eslint/explicit-module-boundary-types`: Enforce explicit return types on functions and class methods.
- `@typescript-eslint/no-explicit-any`: Disallow the use of the `any` type.

### Best Practices

1. **Consistent Code Style**: Use Prettier to maintain a consistent code style across your project. This helps improve readability and reduces the cognitive load when switching between files.

2. **Linting Before Committing**: Integrate ESLint and Prettier into your pre-commit hooks using tools like `husky` and `lint-staged`. This ensures that code is linted and formatted before it is committed.

3. **Run Linting in CI/CD**: Include linting as part of your Continuous Integration/Continuous Deployment (CI/CD) pipeline to catch issues early in the development process.

4. **Use TypeScript's Strict Mode**: Enable strict mode in your `tsconfig.json` to catch potential issues early. This works well with ESLint to enforce type safety.

5. **Regularly Update Dependencies**: Keep your ESLint, Prettier, and related packages up to date to benefit from the latest features and bug fixes.

6. **Customize Rules**: Adjust ESLint rules based on your team's preferences and project requirements. Use the ESLint documentation to find rules that suit your coding style.

### Troubleshooting

If you encounter issues with ESLint and Prettier, consider the following:

- Ensure that your ESLint and Prettier configurations do not conflict. Use `eslint-config-prettier` to disable conflicting rules.
- If you see errors related to unused variables, ensure that your ESLint rules are set up to ignore parameters prefixed with an underscore.

By following these steps and best practices, you can effectively set up Prettier and ESLint in your project, ensuring high code quality and consistency.
