module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    'max-params': ['error', 2],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prettier/prettier': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['../*', './*'],
        paths: [
          {
            name: '..',
            message:
              'Use path aliases (e.g., @src/, @shared/, @domains/) instead of relative imports.',
          },
          {
            name: '.',
            message:
              'Use path aliases (e.g., @src/, @shared/, @domains/) instead of relative imports.',
          },
        ],
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules'],
};
