import pluginJest from 'eslint-plugin-jest';
import globals from 'globals';
import pluginTs from 'typescript-eslint';

// prettier-ignore
const globalIgnoredFiles = {
  ignores: [
    // '*.config.js',
    'out/**/*.js',
    'test/**/*.js'
  ]
};

const pluginTsCustomizations = {
    languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.node,
        sourceType: 'module',
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    plugins: { pluginTs },
    rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/array-type': 'warn',
        '@typescript-eslint/no-inferrable-types': 'warn',
    },
};

const pluginJestCustomizations = {
    languageOptions: {
        globals: pluginJest.environments.globals.globals,
    },
    files: ['**/*.test.ts'],
    plugins: { jest: pluginJest },
    rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/prefer-to-have-length': 'warn',

        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/valid-expect': 'error',
    },
};

export default pluginTs.config(
    pluginTs.configs.recommendedTypeChecked,
    globalIgnoredFiles,
    pluginTsCustomizations,
    pluginJestCustomizations,
);
