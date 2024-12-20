import {
	capitalize,
	delimitedList,
	describeQuantity,
	indefiniteArticleFor,
	isCapitalized,
	startsWithVowel,
} from '../../../src/util/string/grammar';
import { setOfEmptyStrings, setOfWhitespaceStrings } from '../../helpers';

// MARK: Fn isCapitalized

describe('Function: isCapitalized', () => {
	test.each(setOfEmptyStrings)('returns false given empty str', value => {
		expect(isCapitalized(value)).toBe(false);
	});

	test.each(['string', '2nd', ' some string'])(
		'returns false given an uncapitalized str',
		value => {
			expect(isCapitalized(value)).toBe(false);
		},
	);

	test.each(['String', 'A string'])('returns true given a capitalized str', value => {
		expect(isCapitalized(value)).toBe(true);
	});

	const setOfUncapitalizedLeadingWhitespaceStrings = setOfWhitespaceStrings.map(
		whitespace => `${whitespace}str`,
	);

	const setOfCapitalizedLeadingWhitespaceStrings = setOfWhitespaceStrings.map(
		whitespace => `${whitespace}Str`,
	);

	test.each(setOfUncapitalizedLeadingWhitespaceStrings)(
		'returns false given uncapitalized str w/ leading whitespace + trim start enabled',
		value => {
			expect(isCapitalized(value, true)).toBe(false);
		},
	);

	test.each(setOfCapitalizedLeadingWhitespaceStrings)(
		'returns true given capitalized str w/ leading whitespace + trim start enabled',
		value => {
			expect(isCapitalized(value, true)).toBe(true);
		},
	);
});

// MARK: Fn capitalize

describe(`Function: capitalize`, () => {
	test.each(['A', 'B', 'C', 'D'])(
		'returns given str when capital str w/ length of 1: %p',
		value => {
			expect(capitalize(value)).toBe(value);
		},
	);

	test.each([
		['', ''],
		[' ', ' '],
		['   ', '   '],
		['    ', '    '],
	])('returns given str when empty or only whitespace', (input, expected) => {
		expect(capitalize(input)).toBe(expected);
	});

	test.each([
		'Some already capitalized string',
		'Hello world',
		'This is already capital',
	])('returns given str when first char already capital: %p', value => {
		expect(capitalize(value)).toBe(value);
	});

	test.each([
		'42 Some uncapitalizable string',
		'% No capital version of the leading character',
		'` Non-Latin alphabet leading character',
	])('returns given str when first char cannot be capitalized: %p', value => {
		expect(capitalize(value)).toBe(value);
	});

	test.each([
		['some uncapitalized string', 'Some uncapitalized string'],
		['a string', 'A string'],
		['string', 'String'],
	])(
		'returns expected capital str when first char uncapital: %p',
		(input, expected) => {
			expect(capitalize(input)).toBe(expected);
		},
	);
});

// MARK: Fn describeQuantity

describe('Function: describeQuantity', () => {
	test.each(setOfEmptyStrings)(
		'throws err when empty str for arg "singular": %p',
		value => {
			expect(() => describeQuantity(10, value)).toThrow();
		},
	);

	const pluralNumbersOfThings = [3, 3.14, 0, -2, 42];

	test.each(pluralNumbersOfThings)(
		'infers a plural noun if arg "plural" is undefined',
		numberOfThings => {
			const expected = `${numberOfThings} cats`;

			expect(describeQuantity(numberOfThings, 'cat', undefined)).toBe(expected);
		},
	);

	test.each(setOfWhitespaceStrings)(
		'infers a plural noun if arg "plural" is whitespace-only str: %p',
		pluralForm => {
			expect(describeQuantity(3, 'dog', pluralForm)).toBe('3 dogs');
		},
	);

	test.each(pluralNumbersOfThings)(
		'infers suffix es if arg "singular" ends in s',
		numberOfThings => {
			const singularForm = 'class';
			const expected = `${numberOfThings} ${singularForm}es`;

			expect(describeQuantity(numberOfThings, singularForm)).toBe(expected);
		},
	);
});

// MARK: Fn delimitedList

describe('Function: delimitedList', () => {
	test.each(['string', 'another string', ' '])(
		'returns given str when items arg is str',
		value => {
			expect(delimitedList(value)).toBe(value);
		},
	);

	it('returns empty str when empty array items arg', () => {
		expect(delimitedList([])).toBe('');
	});
});

// MARK: Fn startsWithVowel

describe('Function: startsWithVowel', () => {
	const vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U'];

	const consonants = [
		'b',
		'B',
		'c',
		'C',
		'd',
		'D',
		'f',
		'F',
		'g',
		'G',
		'h',
		'H',
		'j',
		'J',
		'k',
		'K',
		'l',
		'L',
		'm',
		'M',
		'n',
		'N',
		'p',
		'P',
		'q',
		'Q',
		'r',
		'R',
		's',
		'S',
		't',
		'T',
		'v',
		'V',
		'w',
		'W',
		'x',
		'X',
		'y',
		'Y',
		'z',
		'Z',
	];

	test.each(vowels)('returns true given vowel str literal: %p', value => {
		expect(startsWithVowel(value)).toBe(true);
	});

	test.each(consonants)('returns false given consonant str literal: %p', value => {
		expect(startsWithVowel(value)).toBe(false);
	});
});

// MARK: Fn indefiniteArticleFor

describe('Function: indefiniteArticleFor', () => {
	test.each([
		['axe', 'an'],
		['box', 'a'],
		['cat', 'a'],
		['dog', 'a'],
		['ex', 'an'],
		['tux', 'a'],
		['ox', 'an'],
		['Uber', 'an'],
	])('returns str which equals expected for given input word', (input, expected) => {
		expect(indefiniteArticleFor(input)).toBe(expected);
	});
});

// MARK: Fn getTypeDisplayName
// TODO
