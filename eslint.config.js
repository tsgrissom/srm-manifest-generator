import globals from 'globals';
import tslint from 'typescript-eslint';

export default tslint.config(
  tslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    }
  },
  {
    languageOptions: {
      globals: globals.node
    },
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist/**/*.js', 'dist/*.js'],
    rules: {
      '@typescript-eslint/curly': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/array-type': 'warn'
    }
  },
  // ...
);