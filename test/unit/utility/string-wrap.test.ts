import {
	doubleQuote,
	endsButDoesNotStartWith,
	isDoubleQuoted,
	isQuoted,
	isSingleQuoted,
	isWrapped,
	quote,
	singleQuote,
	startsButDoesNotEndWith,
	unquote,
	unwrap,
	wrap,
} from '../../../src/utility/string-wrap';

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
		['String', '**', false],
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
		[`Partial Quoted (single, trail)'`, `'`, false],
	])('returns expected for given input parameters', (str, sequence, expected) => {
		expect(isWrapped(str, sequence)).toBe(expected);
	});
});

// MARK: Fn wrap

// TODO
describe('Function: wrap', () => {
	it('throws err when empty str for arg "sequence"', () => {
		expect(() => wrap('string', '')).toThrow();
	});

	test.each([
		// str, sequence, force, fixPartialWrap, expected
		['Hello', '**', false, false, '**Hello**'],
		['Hello', '**', true, false, '**Hello**'],
		['**Hello**', '**', true, false, '****Hello****'],
		['**Hello', '**', true, false, '****Hello**'],
		['Hello**', '**', true, false, '**Hello****'],
		['Hello', '**', false, true, '**Hello**'],
		['**Hello', '**', false, true, '**Hello**'],
		['Hello**', '**', false, true, '**Hello**'],
	])(
		'returns expected for given input parameters',
		(str, sequence, force, fixPartialWrap, expected) => {
			expect(wrap(str, sequence, force, fixPartialWrap)).toBe(expected);
		},
	);
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
		['Hello**', '**', true, 'Hello'],
	])(
		'returns expected for given input parameters',
		(str, sequence, removePartialWrap, expected) => {
			expect(unwrap(str, sequence, removePartialWrap)).toBe(expected);
		},
	);
});

// MARK: Fn isSingleQuoted

// TODO Rewrite to use collapsed syntax (array)
describe('Function: isSingleQuoted', () => {
	test.each([
		[`"str"`, false],
		[`'str'`, true],
		[`str`, false],
		[`'Str`, false],
		[`str'`, false],
		[`"str`, false],
		[`str"`, false],
	])('returns expected for given input string: %p', (input, expected) => {
		expect(isSingleQuoted(input)).toBe(expected);
	});
});

// MARK: Fn isDoubleQuoted

// TODO Rewrite to use collapsed syntax (array)
describe('Function: isDoubleQuoted', () => {
	test.each([
		[`"str"`, true],
		[`'str'`, false],
		[`str`, false],
		[`'str`, false],
		[`str'`, false],
		[`"str`, false],
		[`str"`, false],
	])('returns expected for given input string: %p', (input, expected) => {
		expect(isDoubleQuoted(input)).toBe(expected);
	});
});

// MARK: Fn isQuoted

// TODO Rewrite to use collapsed syntax (array)
describe('Function: isQuoted()', () => {
	test.each([
		// str, acceptSingleQuotes, expected
		[`"str"`, false, true],
		[`"str"`, true, true],
		[`'str'`, false, false],
		[`'str'`, true, true],
		[`str`, false, false],
		[`str`, true, false],
		[`'str`, false, false],
		[`'str`, true, false],
		[`str'`, false, false],
		[`str'`, true, false],
		[`"str`, false, false],
		[`"str`, true, false],
		[`str"`, false, false],
		[`str"`, true, false],
	])(
		'returns expected for given input parameters',
		(str, acceptSingleQuotes, expected) => {
			expect(isQuoted(str, acceptSingleQuotes)).toBe(expected);
		},
	);
});

// MARK: Fn singleQuote

describe('Function: singleQuote()', () => {
	test.each([
		// expected, str, force, fixPartialWrap
		["'str'", 'str', false, false], // normal wrap
		[`'"str"'`, `"str"`, false, false], // both quote styles (already double)
		["'str'", "'str'", false, false], // already wrapped
		["'str", "'str", false, false], // partial wrap unaffected (no trail)
		["'str'", "'str", false, true], // fix partial wrap (no trail)
		["str'", "str'", false, false], // partial wrap unaffected (no lead)
		["'str'", "str'", false, true], // fix partial wrap (no lead)
		["''str''", "'str'", true, false], // force wrap an already wrapped
		["''str'", "'str", true, false], // force wrap already partial wrapped (no trail)
		["'str''", "str'", true, false], // force wrap already partial wrapped (no lead)
	])(
		'returns %p from input %p w/ force=%p & fixPartialWrap=%p',
		(expected, input, force, fixPartialWrap) => {
			expect(singleQuote(input, force, fixPartialWrap)).toBe(expected);
		},
	);
});

// MARK: Fn doubleQuote

describe('Function: doubleQuote()', () => {
	test.each([
		// expected, str, force, fixPartialWrap
		// TODO Find solution to how ugly this ordering is, expected first bleh
		['"str"', 'str', false, false], // normal wrap
		[`"'str'"`, `'str'`, false, false], // both quote styles (already single)
		['"str"', '"str"', false, false], // already wrapped
		['"str', '"str', false, false], // partial wrap unaffected (no trail)
		['"str"', '"str', false, true], // fix partial wrap (no trail)
		['str"', 'str"', false, false], // partial wrap unaffected (no lead)
		['"str"', 'str"', false, true], // fix partial wrap (no lead)
		['""str""', '"str"', true, false], // force wrap an already wrapped
		['""str"', '"str', true, false], // force wrap already partial wrapped (no trail)
		['"str""', 'str"', true, false], // force wrap already partial wrapped (no lead)
	])(
		'returns %p from input %p w/ force=%p & fixPartialWrap=%p',
		(expected, input, force, fixPartialWrap) => {
			expect(doubleQuote(input, force, fixPartialWrap)).toBe(expected);
		},
	);
});

// MARK: Fn quote

describe('Function: quote()', () => {
	test.each([
		// str, useSingleQuotes, force, fixPartialWrap, expected
		[`string`, false, false, false, `"string"`], // non-quoted -> double-quoted
		[`string`, true, false, false, `'string'`], // non-quoted -> single-quoted
		[`"string"`, false, true, false, `""string""`], // double-quoted -> force double-quoted
		[`'string'`, true, true, false, `''string''`], // single-quoted -> force single-quoted
		[`"string"`, true, true, false, `'"string"'`], // double-quoted -> nested mixed quotes, outer single, inner double
		[`'string'`, false, true, false, `"'string'"`], // single-quoted -> nested mixed quotes, outer double, inner single
		[`"string`, false, true, false, `""string"`], // lead-only double-quote -> 2 double-quote lead + 1 double-quote trail
		[`string"`, false, true, false, `"string""`], // trail-only double-quote -> 1 double-quote lead + 2 double-quote trail
		[`'string`, true, true, false, `''string'`], // lead-only single-quote -> 2 single-quote lead + 1 single-quote trail
		[`string'`, true, true, false, `'string''`], // trail-only single-quote -> 1 single-quote lead + 2 single-quote trail
		[`"string`, false, false, true, `"string"`], // lead-only double-quote -> fix partial wrap -> double-quoted
		[`string"`, false, false, true, `"string"`], // trail-only double-quote -> fix partial wrap -> double-quoted
		[`'string`, true, false, true, `'string'`], // lead-only double-quote -> fix partial wrap -> double-quoted
		[`string'`, true, false, true, `'string'`], // trail-only double-quote -> fix partial wrap -> double-quoted
	])(
		'returns expected for given input parameters',
		(str, useSingleQuotes, force, fixPartialWrap, expected) => {
			expect(quote(str, useSingleQuotes, force, fixPartialWrap)).toBe(expected);
		},
	);
});

// MARK: Fn unquote
describe('Function: unquote()', () => {
	test.each([
		// str, useSingleQuotes, removePartialWrap, expected
		[`string`, false, false, 'string'], // non-quoted -> given str
		[`string`, true, true, 'string'], // non-quoted -> given str
		[`string`, true, false, 'string'], // non-quoted -> given str
		[`string`, false, true, 'string'], // non-quoted -> given str

		[`"string"`, false, false, `string`], // double-quoted -> useSingleQuotes off -> unquoted
		[`"string"`, true, false, `string`], // double-quoted -> useSingleQuotes on  -> unquoted
		[`'string'`, false, false, `'string'`], // single-quoted -> useSingleQuotes off -> given str
		[`'string'`, true, false, `string`], // single-quoted -> useSingleQuotes on  -> unquoted

		[`"string`, false, false, `"string`], // lead-only double-quote  -> removePartialWrap off -> given str
		[`string"`, false, false, `string"`], // trail-only double-quote -> removePartialWrap off -> given str
		[`'string`, false, false, `'string`], // lead-only single-quote  -> removePartialWrap off -> given str
		[`'string`, true, false, `'string`], // lead-only single-quote  -> removePartialWrap off -> given str
		[`string'`, false, false, `string'`], // trail-only single-quote -> removePartialWrap off -> given str
		[`string'`, true, false, `string'`], // trail-only single-quote -> removePartialWrap off -> given str

		[`"string`, false, true, `string`], // lead-only double-quote  -> removePartialWrap on -> partial quote removed
		[`string"`, false, true, `string`], // trail-only double-quote -> removePartialWrap on -> partial quote removed
		[`'string`, true, true, `string`], // lead-only single-quote  -> useSingleQuotes + removePartialWrap on -> partial quote removed
		[`string'`, true, true, `string`], // trail-only single-quote -> useSingleQuotes + removePartialWrap on -> partial quote removed
	])(
		'[str=%p | useSingleQuotes=%p | removePartialWrap=%p | expected=%p] returns expected for given input parameters',
		(str, useSingleQuotes, removePartialWrap, expected) => {
			expect(unquote(str, useSingleQuotes, removePartialWrap)).toBe(expected);
		},
	);
});
