import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "build", "node_modules", "upload.js", "**/*.test.js"] },

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-console': ['error', { allow: ['warn', 'error'] }],

      'indent': ['error', 2],                
      'react/jsx-indent': ['error', 2],       
      'react/jsx-indent-props': ['error', 2], 

      'no-unused-vars': ['error', { 
        "vars": "all", 
        "args": "after-used", 
        "ignoreRestSiblings": true 
      }],

      'react/no-unknown-property': ['error', { ignore: ['class'] }], 

      'react-hooks/exhaustive-deps': 'error', 

      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
]