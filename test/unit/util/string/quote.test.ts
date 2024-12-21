// MARK: isSingleQuoted

import {
	doubleQuote,
	isDoubleQuoted,
	isQuoted,
	isSingleQuoted,
	quote,
	singleQuote,
	unquote,
} from '../../../../src/util/string/quote';

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

// MARK: isDoubleQuoted
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

// MARK: isQuoted
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

// MARK: singleQuote
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

// MARK: doubleQuote
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

// MARK: quote
describe('Function: quote()', () => {
	test.each([
		// str, useSingleQuotes, force, fixPartialWrap, expected
		[`string`, false, false, false, `"string"`], // non-quoted -> double-quoted
		[`string`, true, false, false, `'string'`],
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
			const result = quote(str, {
				singleQuotes: useSingleQuotes,
				force: force,
				partialWrap: fixPartialWrap,
			});
			expect(result).toBe(expected);
		},
	);
});

// MARK: unquote
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
		(str, singleQuotes, partialUnwrap, expected) => {
			expect(
				unquote(str, {
					singleQuotes: singleQuotes,
					force: false,
					partialWrap: partialUnwrap,
				}),
			).toBe(expected);
		},
	);
});
