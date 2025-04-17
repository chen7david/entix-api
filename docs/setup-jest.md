# Jest Setup

[← Back to README](../README.md)

---

## Testing Setup with Jest and TypeScript

We use **Jest** for testing. Merely installing `@types/jest` is not enough for TypeScript to recognize Jest globals (like `describe`, `it`, `expect`).

### Key Steps

- Add `jest` to the `types` array in the relevant `tsconfig` (e.g., `tsconfig.test.json` or root `tsconfig.json`).
- Ensure your editor and TypeScript tooling use the correct config (usually the root `tsconfig.json`).
- Configure Jest to use the correct TypeScript config via `jest.config.ts`:

```ts
transform: {
  "^.+\\.tsx?$": [
    "ts-jest",
    {
      tsconfig: "./tsconfig/tsconfig.test.json",
    },
  ],
},
```

### Example tsconfig for Jest

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

---

- [TypeScript Setup](./setup-typescript.md)
- [Path Aliases Setup](./setup-path-aliases.md)
