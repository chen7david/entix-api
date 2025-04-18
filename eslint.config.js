const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

/** @type {import('eslint').Linter.Config} */
module.exports = [
  {
    // General settings
    files: ['**/*.{js,ts}'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    // Configure TypeScript and Prettier plugins
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    // Rules
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      // Rules that catch common issues
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      // Rules that might cause issues in CI, set to warning instead of error
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
