# TypeScript Setup

[← Back to README](../README.md)

---

## Base TypeScript Configuration

We use a base config (`tsconfig.base.json`) to centralize all common TypeScript options (such as `target`, `module`, `baseUrl`, and `paths`).

**Why?**

- Promotes consistency across different environments (build, test, dev).
- Makes it easy to update shared settings in one place.
- Reduces duplication and errors.

## Inheriting from the Base Config

Other config files (e.g., `tsconfig.build.json`, `tsconfig.test.json`, and the root `tsconfig.json`) use the `extends` property to inherit from the base config. This allows each environment to override or add specific options as needed.

**Example:**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

## Explanation of Each tsconfig

- **tsconfig.base.json**: Centralizes all shared TypeScript options and path aliases.
- **tsconfig.build.json**: Used for production builds. Extends the base config and may override `outDir`, `rootDir`, or exclude test files.
- **tsconfig.test.json**: Used for testing. Extends the base config and adds Jest types.
- **tsconfig.json** (root): Used by editors and as a default for TypeScript tools. Extends the base config and ensures global types (like Jest) are available for intellisense.

---

- [Jest Setup](./setup-jest.md)
- [Path Aliases Setup](./setup-path-aliases.md)
