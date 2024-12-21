import {
	endsButDoesNotStartWith,
	isWrapped,
	startsButDoesNotEndWith,
	unwrap,
	wrap,
} from '../../../../src/util/string/wrap';

// MARK: startsButDoesNotEndWith
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

// MARK: endsButDoesNotStartWith
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

// MARK: isWrapped
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
		expect(isWrapped({ str: str, seq: sequence })).toBe(expected);
	});
});

// MARK: wrap
// TODO
describe('Function: wrap', () => {
	it('throws err when empty str for arg "sequence"', () => {
		expect(() => wrap({ str: `string`, seq: `` })).toThrow();
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
			expect(wrap({ str: str, seq: sequence }, force, fixPartialWrap)).toBe(
				expected,
			);
		},
	);
});

// MARK: unwrap
// TODO Rewrite to use collapsed syntax (array)
describe('Function: unwrap', () => {
	it('throws err when empty str for arg "sequence"', () => {
		expect(() => unwrap({ str: 'string', seq: '' })).toThrow();
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
			expect(unwrap({ str: str, seq: sequence }, removePartialWrap)).toBe(expected);
		},
	);
});
