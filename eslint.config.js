import pluginJest from 'eslint-plugin-jest';
import globals from 'globals';
import pluginTs from 'typescript-eslint';

// prettier-ignore
const globalIgnoredFiles = {
	ignores: [
		'*.config.js', // TODO Figure out why this warns if removed
		'dist/**/*.js',
		'test/**/*.js'
    ],
};

// MARK: TypeScript
/** @see https://typescript-eslint.io/getting-started/ */
const pluginTsCustomizations = {
	languageOptions: {
		ecmaVersion: 'latest',
		globals: globals.node,
		sourceType: 'module',
		parserOptions: {
			projectService: true,
			project: './tsconfig.json',
			tsconfigRootDir: import.meta.dirname,
		},
	},
	plugins: { pluginTs },
	/** @see https://typescript-eslint.io/rules/ */ // TODO Review rules
	rules: {
		'@typescript-eslint/consistent-generic-constructors': ['warn', 'type-annotation'],
		'@typescript-eslint/dot-notation': 'warn',
		'@typescript-eslint/explicit-member-accessibility': [
			'error',
			{ accessibility: 'explicit' },
		],
		'@typescript-eslint/max-params': ['warn', { max: 3 }],
		'@typescript-eslint/no-confusing-non-null-assertion': 'warn',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-inferrable-types': 'warn',

		'@typescript-eslint/array-type': ['error', { default: 'generic' }], // TODO Change?
		'@typescript-eslint/class-literal-property-style': ['error', 'getters'],
		'@typescript-eslint/class-methods-use-this': 'error',
		'@typescript-eslint/explicit-function-return-type': [
			'error',
			{ allowConciseArrowFunctionExpressionsStartingWithVoid: true },
		],
	},
};

// MARK: Jest
/** @see https://www.npmjs.com/package/eslint-plugin-jest */
const pluginJestCustomizations = {
	languageOptions: {
		globals: pluginJest.environments.globals.globals,
	},
	files: ['test/**/*.test.ts'],
	plugins: { jest: pluginJest }, // TODO Add some TS rules as well
	rules: {
		// TODO Make utility function `each` instead of `test.each` then enable this rule
		// 'jest/consistent-test-it': ['warn', { fn: 'test', withinDescribe: 'it' }],
		'jest/no-disabled-tests': 'warn',
		'jest/prefer-todo': 'warn',
		'jest/prefer-lowercase-title': ['warn', { ignore: ['describe', 'test'] }],
		'jest/prefer-to-be': 'warn',
		'jest/prefer-to-contain': 'warn',
		'jest/prefer-to-have-length': 'warn',
		'jest/prefer-jest-mocked': 'warn',
		'jest/valid-title': 'warn',

		'jest/expect-expect': 'error',
		'jest/no-alias-methods': 'error',
		'jest/no-focused-tests': 'error',
		'jest/no-identical-title': 'error',
		'jest/valid-describe-callback': 'error',
		'jest/valid-expect': 'error',

		'@typescript-eslint/max-params': 'off',
	},
};

export default pluginTs.config(
	pluginTs.configs.recommendedTypeChecked,
	globalIgnoredFiles,
	pluginTsCustomizations,
	pluginJestCustomizations,
);
