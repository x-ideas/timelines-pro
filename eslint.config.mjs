import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.mjs';
import globals from 'globals';

/**
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  {
    name: 'svelte-config',
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    name: 'ignores',
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  {
    name: 'custom',
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      // https://typescript-eslint.io/rules/consistent-type-imports/
      // 自动改为type引用
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          // 允许type T = import('Foo').Foo;
          disallowTypeAnnotations: false,
          prefer: 'type-imports',
        },
      ],

      // Override or add rule settings here, such as:
      // 'svelte/rule-name': 'error'
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
