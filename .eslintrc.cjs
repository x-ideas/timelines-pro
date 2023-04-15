/**
 * @type {import('eslint').Linter.Config)}
 */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        // 允许type T = import('Foo').Foo;
        disallowTypeAnnotations: false,
        prefer: 'type-imports',
      },
    ],
  },
};
