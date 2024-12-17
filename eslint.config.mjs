import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['*.config.mjs', 'dist/**/*.js', 'out/**/*.js', 'test.old/**']
  },
  js.configs.recommended,
  ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      ts
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/curly': 'off',
      
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn'
    }
  }
);