# Path Aliasing Setup (`@src`) for TypeScript, ts-node, Jest, and tsc builds

## Why Path Aliasing?

Path aliasing allows you to use clean, descriptive import paths like `@src/foo/bar` instead of brittle, hard-to-read relative paths like `../../../foo/bar`. This improves code readability, maintainability, and makes refactoring easier.

## Why Do We Need Four Things?

1. **TypeScript**: Needs to understand the alias for type checking and editor support.
2. **ts-node**: Needs to resolve the alias at runtime for development and scripts.
3. **Jest**: Needs to resolve the alias in tests.
4. **tsc build**: Needs to convert the alias to relative paths in the compiled output.

Each tool has its own resolver, so all must be configured for a seamless experience.

## Why Do We Need Both `tsconfig-paths` and `tsc-alias`?

- **`tsconfig-paths`**: Allows `ts-node` to resolve TypeScript path aliases at runtime. Without it, `ts-node` will fail to find aliased imports.
- **`tsc-alias`**: After building with `tsc`, the output files still contain the alias. `tsc-alias` rewrites these to relative paths, so your production code works without custom loaders.

## Step-by-Step Setup

### 1. Install Dependencies

```sh
npm install --save-dev tsconfig-paths tsc-alias
```

### 2. Configure `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    // ... other options ...
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"],
    },
  },
}
```

### 3. Update `package.json` Scripts

```jsonc
{
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec ts-node -r tsconfig-paths/register src/server.ts",
    "build": "tsc && tsc-alias",
  },
}
```

- `ts-node -r tsconfig-paths/register ...` enables aliasing in dev.
- `tsc && tsc-alias` ensures built files have correct relative imports.

### 4. Configure Jest (`jest.config.ts`)

```ts
const config: Config = {
  // ...
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 5. Usage Example

```ts
// Instead of:
import { hello } from '../../../server';
// Use:
import { hello } from '@src/server';
```

### 6. Best Practices

- Use clear, descriptive alias names (e.g., `@src`).
- Document all aliases and their rationale.
- Prefer `type` over `interface` in TypeScript.
- Keep configuration DRY and modular.
- Restart your editor after changing `tsconfig.json`.

### 7. Known Limitations

- All tools must be configured; missing one will cause runtime or test errors.
- If you move files, update the alias mapping if needed.

## References

- [TypeScript docs: Module Resolution](https://www.typescriptlang.org/tsconfig#paths)
- [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths)
- [tsc-alias](https://www.npmjs.com/package/tsc-alias)
- [Jest docs: moduleNameMapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)
