# ESLint Configuration

This project uses [ESLint](https://eslint.org/) with TypeScript and Prettier integration to ensure code quality and consistent formatting.

## Configuration

- ESLint is configured in a single `.eslintrc.js` file at the project root.
- Prettier settings are defined in `package.json` under the `prettier` key.
- The `plugin:prettier/recommended` preset ensures ESLint and Prettier do not conflict.

## Usage

- **Lint code:**
  ```bash
  npm run lint
  ```
- **Auto-fix issues:**
  ```bash
  npm run lint:fix
  ```

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier Integration](https://prettier.io/docs/en/integrating-with-linters.html)
