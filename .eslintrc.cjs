module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
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
              'Use path aliases (e.g., @src/, @core/, @modules/) instead of relative imports.',
          },
          {
            name: '.',
            message:
              'Use path aliases (e.g., @src/, @core/, @modules/) instead of relative imports.',
          },
        ],
      },
    ],
    'jest/no-focused-tests': 'error',
    'jest/no-disabled-tests': 'error',
  },
  ignorePatterns: ['dist', 'node_modules'],
};
