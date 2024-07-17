import js from "@eslint/js";
import stylistic from '@stylistic/eslint-plugin'

export default [
  js.configs.recommended,
  {
    "name": "litegraph.tsx/standard",
    "languageOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "plugins": {
      "@stylistic":stylistic
    },
    "rules": {
      "no-inner-declarations":0,
      "no-prototype-builtins":0,
      "no-redeclare":0,
      "no-undef":0, /* had to disable because it doesn't recognize DOM objects */
      "no-unused-vars":[0, {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@stylistic/arrow-parens": [0, "always"],
      "@stylistic/arrow-spacing": [0, { "before": true, "after": true }],
      "@stylistic/brace-style":[0, "1tbs", {"allowSingleLine":false}],
      "@stylistic/comma-dangle": [1, "always-multiline"],
      "@stylistic/comma-spacing": [1, { "before": false, "after": true }],
      "@stylistic/comma-style": [1, "last"],
      "@stylistic/computed-property-spacing": [0, "never"],
      "@stylistic/dot-location": [0, "object"],
      "@stylistic/eol-last": [1, "always"],
      "@stylistic/function-call-spacing": [1, "never"],
      "@stylistic/function-paren-newline": [0, "multiline"],
      "@stylistic/implicit-arrow-linebreak": [0, "beside"],
      "@stylistic/indent": [1, 2],
      "@stylistic/indent-binary-ops":[0, 2],
      "@stylistic/key-spacing":[1, {
        "beforeColon":false,
        "afterColon":true,
        "mode":"strict"
      }],
      "@stylistic/keyword-spacing":[1, {
        "before": true,
        "after": true,
        "overrides": {}
      }],
      "@stylistic/lines-around-comment":[0, {"beforeBlockComment": true} ],
      "@stylistic/lines-between-class-members":[0,{
        "enforce": "always",
        "exceptAfterSingleLine": false,
      }],
      "@stylistic/max-len":[0,{
        "code": 120,
        "tabWidth": 2,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true
      }],
      "@stylistic/max-statements-per-line":[0, {"max":1} ],
      "@stylistic/new-parens":[0, "always"],
      "@stylistic/no-extra-semi":[1],
      "@stylistic/no-floating-decimal":[2],
      "@stylistic/no-multi-spaces":[1],
      "@stylistic/no-tabs":[1],
      "@stylistic/no-trailing-spaces":[1],
      "@stylistic/object-curly-newline":[0, {"multiline":true} ],
      "@stylistic/quotes":[0,
        "double",
        {"allowTemplateLiterals": true}
      ],
      "@stylistic/semi-style":[1, "last"],
      "@stylistic/space-before-blocks":[1, "always"],
      "@stylistic/spaced-comment":[1, "always"],
    }
  }
]
