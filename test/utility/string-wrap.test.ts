import {
	startsButDoesNotEndWith,
	isWrapped,
	wrap,
	unwrap,
	isQuoted,
	isDoubleQuoted,
	isSingleQuoted,
	quote,
	unquote,
	doubleQuote,
	singleQuote,
	endsButDoesNotStartWith
} from '../../src/utility/string-wrap';

// MARK: Fn startsButDoesNotEndWith

describe('Function: startsButDoesNotEndWith', () => {
	test.each([
		// str, sequence, expected
		['**String', '**', true],
		['**String**', '**', false],
		['String**', '**', false],
		['String', '**', false],
	])('returns expected for given input parameters', (str, sequence, expected) => {
		expect(startsButDoesNotEndWith(str, sequence)).toBe(expected);
	});
});

// MARK: Fn endsButDoesNotStartWith

describe('Function: endsButDoesNotStartWith', () => {
	test.each([
		// str, sequence, expected
		['**String', '**', false],
		['**String**', '**', false],
		['String**', '**', true],
		['String', '**', false]
	])('returns expected for given input parameters', (str, sequence, expected) => {
		expect(endsButDoesNotStartWith(str, sequence)).toBe(expected);
	});
});

// MARK: Fn isWrapped

// TODO Rewrite to use collapsed syntax (array)
describe('Function: isWrapped', () => {
	test.each([
		['Unquoted (double)', '"', false],
		['"Quoted (double)"', '"', true],
		['"Partial Quoted (double, lead)', '"', false],
		['Partial Quoted (double, trail)"', '"', false],
		['Unquoted (single)', `'`, false],
		[`'Quoted (single)'`, `'`, true],
		[`'Partial Quoted (single, lead)`, `'`, false],
		[`Partial Quoted (single, trail)'`, `'`, false]

	])('returns expected for given input parameters', (str, sequence, expected) => {
		expect(isWrapped(str, sequence)).toBe(expected);
	});
});

// MARK: Fn wrap

// TODO
describe('Function: wrap', () => {

	test.each([
		// str, sequence, force, fixPartialWrap, expected
		['Hello', '**', false, false, '**Hello**'],
		['Hello', '**', true, false, '**Hello**'],
		['**Hello**', '**', true, false, '****Hello****'],
		['**Hello', '**', true, false, '****Hello**'],
		['Hello**', '**', true, false, '**Hello****'],
		['Hello', '**', false, true, '**Hello**'],
		['**Hello', '**', false, true, '**Hello**'],
		['Hello**', '**', false, true, '**Hello**']
	])('returns expected for given input parameters', (str, sequence, force, fixPartialWrap, expected) => {
		expect(wrap(str, sequence, force, fixPartialWrap)).toBe(expected);
	});

});

// MARK: Fn unwrap

// TODO Rewrite to use collapsed syntax (array)
describe('Function: unwrap', () => {
	it('throws err when empty str for arg "sequence"', () => {
		expect(() => unwrap('string', '')).toThrow();
	});

	test.each([
		// str, sequence, removePartialWrap, expected
		['**Hello**', '**', false, 'Hello'],
		['**Hello', '**', false, '**Hello'],
		['**Hello', '**', true, 'Hello'],
		['Hello**', '**', false, 'Hello**'],
		['Hello**', '**', true, 'Hello']
	])('returns expected for given input parameters', (str, sequence, removePartialWrap, expected) => {
		expect(unwrap(str, sequence, removePartialWrap)).toBe(expected);
	});
});

// MARK: Fn isSingleQuoted

// TODO Rewrite to use collapsed syntax (array)
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

// TODO Rewrite to use collapsed syntax (array)
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

// TODO Rewrite to use collapsed syntax (array)
describe('Function: isQuoted()', () => {

    test.each([
		{
			params: {
				str: `"Str"`,
				acceptSingleQuotes: false
			},
			expected: true
		},
		{
			params: {
				str: `"Str"`,
				acceptSingleQuotes: true
			},
			expected: true
		},
		{
			params: {
				str: `'Str'`,
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: `'Str'`,
				acceptSingleQuotes: true
			},
			expected: true
		},
		{
			params: {
				str: 'Str',
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: 'Str',
				acceptSingleQuotes: true
			},
			expected: false
		},
		{
			params: {
				str: `'Str`,
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: `'Str`,
				acceptSingleQuotes: true
			},
			expected: false
		},
		{
			params: {
				str: `Str'`,
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: `Str'`,
				acceptSingleQuotes: true
			},
			expected: false
		},
		{
			params: {
				str: `"Str`,
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: `"Str`,
				acceptSingleQuotes: true
			},
			expected: false
		},
		{
			params: {
				str: `Str"`,
				acceptSingleQuotes: false
			},
			expected: false
		},
		{
			params: {
				str: `Str"`,
				acceptSingleQuotes: true
			},
			expected: false
		}
    ])('returns expected for given input parameters', data => {
        const { params, expected } = data;
        expect(isQuoted(params.str, params.acceptSingleQuotes)).toBe(expected);
    });

});

// MARK: Fn singleQuote

describe('Function: singleQuote()', () => {
	test.each([
		// expected, str, force, fixPartialWrap
		["'str'", "str", false, false],     // normal wrap
		[`'"str"'`, `"str"`, false, false], // both quote styles (already double)
		["'str'", "'str'", false, false],   // already wrapped
		["'str", "'str", false, false],     // partial wrap unaffected (no trail)
		["'str'", "'str", false, true],     // fix partial wrap (no trail)
		["str'", "str'", false, false],     // partial wrap unaffected (no lead)
		["'str'", "str'", false, true],     // fix partial wrap (no lead)
		["''str''", "'str'", true, false],  // force wrap an already wrapped
		["''str'", "'str", true, false],    // force wrap already partial wrapped (no trail)
		["'str''", "str'", true, false],    // force wrap already partial wrapped (no lead)
	])(
		'returns %p from input %p w/ force=%p & fixPartialWrap=%p',
		(expected, input, force, fixPartialWrap) => {
			expect(singleQuote(input, force, fixPartialWrap)).toBe(expected);
		}
	)
});

// MARK: Fn doubleQuote

describe('Function: doubleQuote()', () => {
	test.each([
		// expected, str, force, fixPartialWrap
		// TODO Find solution to how ugly this ordering is, expected first bleh
		['"str"', 'str', false, false],    // normal wrap
		[`"'str'"`, `'str'`, false, false],// both quote styles (already single)
		['"str"', '"str"', false, false],  // already wrapped
		['"str', '"str', false, false],    // partial wrap unaffected (no trail)
		['"str"', '"str', false, true],    // fix partial wrap (no trail)
		['str"', 'str"', false, false],    // partial wrap unaffected (no lead)
		['"str"', 'str"', false, true],    // fix partial wrap (no lead)
		['""str""', '"str"', true, false], // force wrap an already wrapped
		['""str"', '"str', true, false],   // force wrap already partial wrapped (no trail)
		['"str""', 'str"', true, false],   // force wrap already partial wrapped (no lead)
	])(
		'returns %p from input %p w/ force=%p & fixPartialWrap=%p',
		(expected, input, force, fixPartialWrap) => {
			expect(doubleQuote(input, force, fixPartialWrap)).toBe(expected);
		}
	)
})

// MARK: Fn quote

describe('Function: quote()', () => {
	test.each([
		// str, useSingleQuotes, force, fixPartialWrap, expected
		// TODO
	])(
		'returns expected for given input parameters',
		(str, useSingleQuotes, force, fixPartialWrap, expected) => {
			expect(quote(str, useSingleQuotes, force, fixPartialWrap)).toBe(expected);
		}
	);
});

// MARK: Fn unquote
describe('Function: unquote()', () => {
	test.each([
		// str, useSingleQuotes, removePartialWrap, expected
		// TODO
	])(
		'returns expected for given input parameters',
		(str, useSingleQuotes, removePartialWrap, expected) => {
			expect(unquote(str, useSingleQuotes, removePartialWrap)).toBe(expected);
		}
	);
});