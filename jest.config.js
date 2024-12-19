/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  collectCoverageFrom: [
    'src/**/*.ts', // Adjust this path to include all source files
    '!src/**/*.d.ts', // Exclude type declaration files
    '!src/**/__tests__/**', // Exclude test files
    '!src/**/__mocks__/**', // Exclude mocks
  ],
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.test.ts'], // Match test files in the test directory
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.m?js$": "babel-jest"
  },
};