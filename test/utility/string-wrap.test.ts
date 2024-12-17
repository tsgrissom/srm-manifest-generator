// MARK: Fn startsButDoesNotEndWith
// TODO

import { isDoubleQuoted, isSingleQuoted, isWrapped, unwrap } from '../../src/utility/string-wrap';

// MARK: Fn endsButDoesNotStartWith
// TODO

// MARK: Fn isWrapped
// TODO

describe('Function: isWrapped', () => {
	test.each([
		{
			params: {
				str: 'Some unquoted string (double)',
				sequence: '"'
			},
			expected: false
		},
		{
			params: {
				str: '"Some double-quoted string"',
				sequence: '"'
			},
			expected: true
		},
		{
			params: {
				str: '"Some partially double-quoted string',
				sequence: '"'
			},
			expected: false
		},
		{
			params: {
				str: 'Some partially double-quoted string"',
				sequence: '"'
			},
			expected: false
		},
		{
			params: {
				str: 'Some unquoted string (single)',
				sequence: "'"
			},
			expected: false
		},
		{
			params: {
				str: "'Some single-quoted string'",
				sequence: "'"
			},
			expected: true
		},
		{
			params: {
				str: "'Some partially single-quoted string",
				sequence: "'"
			},
			expected: false
		},
		{
			params: {
				str: "Some partially single-quoted string'",
				sequence: "'"
			},
			expected: false
		}
	])('returns expected for given input parameters', data => {
		const { params, expected } = data;
		expect(isWrapped(params.str, params.sequence)).toBe(expected);
	});
});

// MARK: Fn wrap
// TODO

// MARK: Fn unwrap

describe('Function: unwrap', () => {
	it('throws err when empty str for arg "sequence"', () => {
		expect(() => unwrap('string', '')).toThrow();
	});

	test.each([
		{
			params: {
				str: `**Hello World**`,
				sequence: `**`,
				removePartialWrap: false
			},
			expected: `Hello World`
		},
		{
			params: {
				str: `**Hello`,
				sequence: `**`,
				removePartialWrap: false
			},
			expected: `**Hello`
		},
		{
			params: {
				str: `**Hello`,
				sequence: `**`,
				removePartialWrap: true
			},
			expected: `Hello`
		},
		{
			params: {
				str: `Hello**`,
				sequence: `**`,
				removePartialWrap: false
			},
			expected: `Hello**`
		},
		{
			params: {
				str: `Hello**`,
				sequence: `**`,
				removePartialWrap: true
			},
			expected: `Hello`
		}
	])('returns expected for given input parameters', data => {
		const { params, expected } = data;
		expect(unwrap(params.str, params.sequence, params.removePartialWrap)).toBe(expected);
	});
});

// MARK: Fn isSingleQuoted

describe('Function: isSingleQuoted', () => {
	test.each([
		{
			input: `"Str"`,
			expected: false
		},
		{
			input: `'Str'`,
			expected: true
		},
		{
			input: 'Str',
			expected: false
		},
		{
			input: `'Str`,
			expected: false
		},
		{
			input: `Str'`,
			expected: false
		},
		{
			input: `"Str`,
			expected: false
		},
		{
			input: `Str"`,
			expected: false
		}
	])('returns expected for given input string: %p', data => {
		const { input, expected } = data;
		expect(isSingleQuoted(input)).toBe(expected);
	});
});

// MARK: Fn isDoubleQuoted

describe('Function: isDoubleQuoted', () => {
	test.each([
		{
			input: `"Str"`,
			expected: true
		},
		{
			input: `'Str'`,
			expected: false
		},
		{
			input: 'Str',
			expected: false
		},
		{
			input: `'Str`,
			expected: false
		},
		{
			input: `Str'`,
			expected: false
		},
		{
			input: `"Str`,
			expected: false
		},
		{
			input: `Str"`,
			expected: false
		}
	])('returns expected for given input string: %p', data => {
		const { input, expected } = data;
		expect(isDoubleQuoted(input)).toBe(expected);
	});
});

// MARK: Fn isQuoted
// TODO

// MARK: Fn singleQuote
// TODO

// MARK: Fn doubleQuote
// TODO

// MARK: Fn quote
// TODO

// MARK: Fn unquote
// TODO
