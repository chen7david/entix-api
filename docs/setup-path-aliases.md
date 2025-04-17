# Path Aliases Setup

[← Back to README](../README.md)

---

## Why Use Path Aliases?

Path aliases (e.g., `@src/*`) make imports cleaner and more maintainable, especially in large projects.

## Configuring Path Aliases in TypeScript

Set up aliases in the `paths` property of your base tsconfig:

```json
{
  "compilerOptions": {
    "baseUrl": "..",
    "paths": {
      "@src/*": ["src/*"]
    }
  }
}
```

## Making Aliases Work at Build and Runtime

- **At build time:** Use [`tsc-alias`](https://www.npmjs.com/package/tsc-alias) to rewrite path aliases in the compiled JavaScript files after `tsc` runs.
- **At runtime (for ts-node):** Use [`tsconfig-paths`](https://www.npmjs.com/package/tsconfig-paths) to resolve aliases when running TypeScript directly.

### Example usage in package.json

```json
"build": "rimraf dist && tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json"
```

## Packages Used

- [`tsc-alias`](https://www.npmjs.com/package/tsc-alias): Rewrites path aliases in build output.
- [`tsconfig-paths`](https://www.npmjs.com/package/tsconfig-paths): Resolves path aliases at runtime (e.g., with ts-node).

---

- [TypeScript Setup](./setup-typescript.md)
- [Jest Setup](./setup-jest.md)
