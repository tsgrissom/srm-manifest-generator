import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import jest from 'eslint-plugin-jest';

export default ts.config(
  {
    ignores: ['*.config.js', 'dist/**/*.js', 'out/**/*.js', 'coverage/**/*.js']
  },
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
    plugins: { ts },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn'
    }
  },
  {
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    files: ['**/*.test.ts'],
    plugins: { jest },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  }
);