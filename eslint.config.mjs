import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin-js';
import { FlatCompat } from '@eslint/eslintrc';

import path from 'path';
import { fileURLToPath } from 'url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('airbnb-base'),
  {
    settings: {
      'import/resolver': {
        node: {},
        typescript: {
          project: './tools/tsconfig.json',
        },
        alias: {
          map: [
            ['@', './src/core'],
            ['@libs', './src/libs'],
            ['@@', '.'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  {
    name: 'airbnb/overrides',
    rules: {
      'array-callback-return': ['off'],
      'block-scoped-var': ['off'],
      'brace-style': ['off'],
      'class-methods-use-this': ['off'],
      'consistent-return': ['off'],
      'default-case': ['off'],
      'func-names': ['off'],
      'guard-for-in': ['off'],
      'import/no-mutable-exports': ['off'],
      'import/prefer-default-export': ['off'],
      'max-classes-per-file': ['off'],
      'max-len': ['off'],
      'new-cap': ['off'],
      'no-alert': ['off'],
      'no-array-constructor': ['off'],
      'no-bitwise': ['off'],
      'no-cond-assign': ['off'],
      'no-console': ['off'],
      'no-continue': ['off'],
      'no-empty': ['off'],
      'no-eval': ['off'],
      'no-extend-native': ['off'],
      'no-lone-blocks': ['off'],
      'no-lonely-if': ['off'],
      'no-loop-func': ['off'],
      'no-mixed-operators': ['off'],
      'no-multi-assign': ['off'],
      'no-multi-str': ['off'],
      'no-nested-ternary': ['off'],
      'no-new-func': ['off'],
      'no-new': ['off'],
      'no-param-reassign': ['off'],
      'no-plusplus': ['off'],
      'no-restricted-globals': ['off'],
      'no-restricted-properties': ['off'],
      'no-restricted-syntax': ['off'],
      'no-return-assign': ['off'],
      'no-sequences': ['off'],
      'no-shadow': ['off'],
      'no-throw-literal': ['off'],
      'no-underscore-dangle': ['off'],
      'no-unused-expressions': ['off'],
      'no-use-before-define': ['off'],
      'no-useless-concat': ['off'],
      'no-var': ['off'],
      'no-void': ['off'],
      'prefer-const': ['off'],
      'prefer-destructuring': ['off'],
      'prefer-rest-params': ['off'],
      'prefer-spread': ['off'],
      'vars-on-top': ['off'],
      camelcase: ['off'],
      eqeqeq: ['off'],
      radix: ['off'],
    },
  },
  {
    name: 'litegraph.tsx/standard',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/js': stylisticJs,
    },
    rules: {
      /* ESLint */
      'no-inner-declarations': 0,
      'no-prototype-builtins': 0,
      'no-redeclare': 0,
      'no-undef': 0, /* had to disable because it doesn't recognize DOM objects */
      'no-unused-vars': [0, {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
  },
];
