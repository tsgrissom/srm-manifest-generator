import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ts.configs.stylistic,
  
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module'
    },
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['out/**/*.js', 'dist/**/*.js'],
    plugins: {
      ts
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/curly': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn'
    }
  }
);