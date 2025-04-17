/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors. Should be last.
  ],
  rules: {
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
