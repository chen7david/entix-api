# ESLint + Prettier Setup for entix-api

## Overview

This project uses [ESLint v8](https://eslint.org/docs/v8.x/) and [Prettier](https://prettier.io/) to ensure code quality, consistency, and maintainability. The configuration is designed for a TypeScript codebase using CommonJS modules, and integrates Prettier with ESLint for a seamless developer experience.

---

## Installation Steps

1. **Install dependencies:**

   ```sh
   npm install --save-dev eslint@^8 @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
   ```

2. **Create ESLint config:**
   - File: `.eslintrc.cjs`
   - Key settings:
     - Uses `@typescript-eslint/parser` for TypeScript support.
     - Extends recommended rules for ESLint, TypeScript, and Prettier.
     - Integrates Prettier as an ESLint plugin to catch formatting issues as lint errors.
     - Custom rules:
       - `max-params`: No more than 2 parameters per function.
       - `@typescript-eslint/no-unused-vars`: Disallows unused variables and imports (with underscore exceptions for intentionally unused).
3. **Create Prettier config:**

   - File: `.prettierrc`
   - Recommended options for modern TypeScript projects.

4. **Add scripts to `package.json`:**
   - `lint`: Run ESLint on all `.ts` and `.js` files.
   - `lint:fix`: Run ESLint with auto-fix.
   - `format`: Format code with Prettier.
   - `format:check`: Check formatting without writing changes.

---

## Rationale for Chosen Rules and Packages

- **ESLint v8**: The latest major version that supports CommonJS. ESLint v9 requires ESM, which is not compatible with this project's current setup.
- **@typescript-eslint**: Provides TypeScript-specific linting rules and parsing.
- **Prettier**: Ensures consistent code formatting. Integrated as an ESLint plugin for unified feedback.
- **eslint-config-prettier**: Disables ESLint rules that would conflict with Prettier.
- **eslint-plugin-prettier**: Runs Prettier as an ESLint rule, so formatting issues appear as lint errors.
- **max-params**: Enforces small, maintainable functions by limiting the number of parameters to 2.
- **no-unused-vars**: Prevents unused imports and variables, reducing dead code and potential confusion.

---

## Things to Watch Out For

- **CommonJS vs ESM**: ESLint v9+ requires ESM (`"type": "module"`), but this project uses CommonJS. Do not upgrade ESLint beyond v8 until you are ready to migrate to ESM.
- **Unused Imports**: The `@typescript-eslint/no-unused-vars` rule will error on unused imports and variables. Prefix intentionally unused variables with `_` to avoid errors.
- **Formatting Conflicts**: All formatting is handled by Prettier. Do not enable conflicting ESLint stylistic rules.
- **Editor Integration**: For best results, install the ESLint and Prettier extensions in your editor (e.g., VS Code) and enable format-on-save.

---

## Best Practices

- **Keep dependencies up to date** (within the v8 ESLint range for now).
- **Use `npm run lint` and `npm run format:check` in CI** to enforce code quality and formatting.
- **Write modular, DRY code** and use descriptive variable names.
- **Document all functions and methods with TSDoc-compliant comments.**
- **Prefer `type` over `interface` in TypeScript** for consistency and simplicity.
- **Review and update lint/format rules as the codebase evolves.**

---

## Example Usage

- **Lint code:**
  ```sh
  npm run lint
  ```
- **Auto-fix lint errors:**
  ```sh
  npm run lint:fix
  ```
- **Format code:**
  ```sh
  npm run format
  ```
- **Check formatting:**
  ```sh
  npm run format:check
  ```

---

## References

- [ESLint v8.x Documentation](https://eslint.org/docs/v8.x/)
- [typescript-eslint Getting Started](https://typescript-eslint.io/getting-started/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
