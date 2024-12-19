/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
	collectCoverageFrom: [
		'src/**/*.ts', // Adjust this path to include all source files
		'!src/**/*.d.ts', // Exclude type declaration files
		'!src/**/__tests__/**', // Exclude test files
		'!src/**/__mocks__/**', // Exclude mocks
	],
	coverageDirectory: 'test/coverage',
	rootDir: '.',
	testMatch: ['<rootDir>/test/**/*.test.ts'], // Match test files in the test directory
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+.tsx?$': ['ts-jest', { useESM: true }],
		'^.+\\.m?js$': 'babel-jest',
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1', // Map .js imports to TypeScript counterparts
	},
};
