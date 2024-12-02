import globals from 'globals';
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    },
    ignores: ['src/**/*.ts', 'test/**/*.ts']
  },
  tslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    },
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['out/**/*.js', 'dist/**/*.js'],
    rules: {
      '@typescript-eslint/curly': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/array-type': 'warn',
    }
  },
  
);