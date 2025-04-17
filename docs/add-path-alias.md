# Adding a Path Alias

[← Back to README](../README.md)

---

## What Are Path Aliases?

Path aliases are custom import paths you define in your TypeScript configuration to simplify and clarify module imports. Instead of using long relative paths like `../../../utils`, you can use a short alias like `@utils`.

## Why Use Path Aliases?

- **Readability:** Cleaner and more descriptive imports.
- **Maintainability:** Easier to refactor and move files without breaking imports.
- **Scalability:** Essential for large codebases to avoid deep relative paths.

## Good vs. Bad Path Aliases

### Good Path Aliases

- `@src/*` for your main source directory
- `@utils/*` for utility functions
- `@models/*` for data models
- `@services/*` for business logic/services
- `@components/*` for UI components (in frontend projects)

### Bad Path Aliases

- Overly generic aliases like `@/*`
- Deeply nested or ambiguous aliases like `@src/utils/helpers/*`
- Aliases that overlap with npm package names

## Steps to Add a New Path Alias

1. **Update your base tsconfig:**
   - Add the new alias to the `paths` section in `tsconfig.base.json`.
2. **Update Jest config:**
   - Add a corresponding entry in `moduleNameMapper` in `jest.config.ts`.
3. **(Optional) Update runtime tools:**
   - If using `ts-node`, ensure `tsconfig-paths` is configured to recognize the new alias.
4. **Update your imports:**
   - Refactor your code to use the new alias where appropriate.

## Example

Suppose you want to add an alias for your `src/services` folder:

- In `tsconfig.base.json`:
  ```json
  "paths": {
    "@services/*": ["src/services/*"]
  }
  ```
- In `jest.config.ts`:
  ```ts
  moduleNameMapper: {
    "^@services/(.*)$": "<rootDir>/src/services/$1"
  }
  ```

---

- [Path Aliases Setup](./setup-path-aliases.md)
- [TypeScript Setup](./setup-typescript.md)
- [Jest Setup](./setup-jest.md)
