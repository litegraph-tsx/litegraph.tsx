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
        typescript: {
          project: './tools/tsconfig.json',
        },
        node: true,
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
  },
  {
    name: 'airbnb/overrides',
    rules: {
      'no-console': ['off'],
      'no-underscore-dangle': ['off'],
      eqeqeq: ['off'],
      'no-param-reassign': ['off'],
      'max-len': ['off'],
      'no-plusplus': ['off'],
      'no-nested-ternary': ['off'],
      'no-restricted-globals': ['off'],
      'func-names': ['off'],
      'block-scoped-var': ['off'],
      'no-var': ['off'],
      'consistent-return': ['off'],
      'vars-on-top': ['off'],
      camelcase: ['off'],
      'no-continue': ['off'],
      'brace-style': ['off'],
      'class-methods-use-this': ['off'],
      'no-bitwise': ['off'],
      'no-multi-assign': ['off'],
      'max-classes-per-file': ['off'],
      'no-empty': ['off'],
      'no-shadow': ['off'],
      'prefer-destructuring': ['off'],
      'default-case': ['off'],
      'no-new': ['off'],
      'no-restricted-syntax': ['off'],
      'no-throw-literal': ['off'],
      'guard-for-in': ['off'],
      'no-multi-str': ['off'],
      'no-new-func': ['off'],
      radix: ['off'],
      'no-use-before-define': ['off'],
      'no-array-constructor': ['off'],
      'import/prefer-default-export': ['off'],
      'no-alert': ['off'],
      'new-cap': ['off'],
      'no-mixed-operators': ['off'],
      'no-return-assign': ['off'],
      'no-lonely-if': ['off'],
      'no-useless-concat': ['off'],
      'no-loop-func': ['off'],
      'no-cond-assign': ['off'],
      'no-extend-native': ['off'],
      'no-restricted-properties': ['off'],
      'no-lone-blocks': ['off'],
      'no-unused-expressions': ['off'],
      'prefer-const': ['off'],
      'no-sequences': ['off'],
      'no-void': ['off'],
      'import/no-mutable-exports': ['off'],
      'prefer-spread': ['off'],
      'prefer-rest-params': ['off'],
      'array-callback-return': ['off'],
      'no-eval': ['off'],
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

      /* Stylistic (alphabetically) */
      '@stylistic/arrow-parens': [0, 'always'],
      '@stylistic/arrow-spacing': [0, { before: true, after: true }],
      '@stylistic/brace-style': [0, '1tbs', { allowSingleLine: false }],
      '@stylistic/comma-dangle': [1, 'always-multiline'],
      '@stylistic/comma-spacing': [1, { before: false, after: true }],
      '@stylistic/comma-style': [1, 'last'],
      '@stylistic/computed-property-spacing': [0, 'never'],
      '@stylistic/dot-location': [0, 'object'],
      '@stylistic/eol-last': [1, 'always'],
      '@stylistic/function-call-spacing': [1, 'never'],
      '@stylistic/function-paren-newline': [0, 'multiline'],
      '@stylistic/implicit-arrow-linebreak': [0, 'beside'],
      '@stylistic/indent': [1, 2],
      '@stylistic/indent-binary-ops': [0, 2],
      '@stylistic/key-spacing': [1, { beforeColon: false, afterColon: true, mode: 'strict' }],
      '@stylistic/keyword-spacing': [1, { before: true, after: true, overrides: {} }],
      '@stylistic/lines-around-comment': [0, { beforeBlockComment: true }],
      '@stylistic/lines-between-class-members': [0, { enforce: 'always', exceptAfterSingleLine: false }],
      '@stylistic/max-len': [0, {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      '@stylistic/max-statements-per-line': [0, { max: 1 }],
      '@stylistic/js/multiline-comment-style': [0, 'starred-block'],
      '@stylistic/new-parens': [0, 'always'],
      '@stylistic/no-extra-semi': [1],
      '@stylistic/no-floating-decimal': [2],
      '@stylistic/no-multi-spaces': [1],
      '@stylistic/no-tabs': [1],
      '@stylistic/no-trailing-spaces': [1],
      '@stylistic/object-curly-newline': [0, { multiline: true }],
      '@stylistic/quotes': [0, 'double', { allowTemplateLiterals: true }],
      '@stylistic/semi-style': [1, 'last'],
      '@stylistic/space-before-blocks': [1, 'always'],
      '@stylistic/spaced-comment': [1, 'always'],
    },
  },
];
