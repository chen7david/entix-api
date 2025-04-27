# Test Setup: TypeScript, Jest, ts-node, and ts-jest

## Why do we need `ts-node` and `ts-jest`?

- **`ts-node`** is required by Jest to parse and execute TypeScript configuration files (like `jest.config.ts`). Jest does not natively understand TypeScript, so it relies on `ts-node` to transpile the config file at runtime.
- **`ts-jest`** is a Jest transformer that allows Jest to run TypeScript test files (`*.test.ts`). It compiles TypeScript code to JavaScript on the fly, enabling seamless testing of TypeScript projects.

## How are they set up in this project?

- **`ts-node`** is installed as a dev dependency and is required automatically by Jest when it detects a TypeScript config file (`jest.config.ts`).
- **`ts-jest`** is specified as the Jest preset in `jest.config.ts`, enabling Jest to process and run TypeScript test files.
- The `dev` script in `package.json` uses `nodemon` with `ts-node` to run the development server directly from TypeScript source files, providing fast feedback during development.

## How does it work?

1. **Running tests**:

   - When you run `npm test`, Jest loads `jest.config.ts`.
   - Jest uses `ts-node` to transpile and execute the TypeScript config file.
   - Jest uses `ts-jest` to transform and run all test files matching `src/**/*.test.ts`.

2. **Development server**:
   - The `dev` script (`npm run dev`) uses `ts-node-dev` to watch for changes in the `src` directory.
   - On changes, `ts-node-dev` efficiently restarts the server using `ts-node` with `--transpile-only` for faster startup, running TypeScript files directly without pre-compiling or full type-checking.

## Summary

- **`ts-node`**: Required for Jest to load TypeScript config files and for `ts-node-dev` to run the dev server.
- **`ts-jest`**: Required for Jest to run TypeScript test files.
- **`nodemon`**: Watches for file changes and restarts the dev server automatically.
- **`ts-node-dev`**: Replaces `nodemon` for faster development restarts by using `ts-node`'s transpile-only mode.

> **Best Practice:** Always keep `ts-node`, `ts-jest`, and `ts-node-dev` up to date to ensure compatibility with the latest TypeScript and Jest features.
