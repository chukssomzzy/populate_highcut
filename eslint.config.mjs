// @ts-check 
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      }
    },
    ignores: [
      'builds/**/*.ts',
      'builds/**',
      "**/*.mjs",
      "eslint.config.mjs",
      "**/*.js"
    ],
    rules:{
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }

);
