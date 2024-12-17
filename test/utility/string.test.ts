import { capitalize, delimitedList, describeQuantity, isCapitalized } from '../../src/utility/string';
import { setOfEmptyStrings, setOfWhitespaceStrings } from '../resource/test-values';

// MARK: Fn isCapitalized

describe('Function: isCapitalized', () => {

    test.each(setOfEmptyStrings)(
        'returns false given empty str',
        value => {
            expect(isCapitalized(value)).toBe(false);
        }
    );

    test.each([
        'string', '2nd', ' some string'
    ])(
        'returns false given an uncapitalized str',
        value => {
            expect(isCapitalized(value)).toBe(false);
        }
    );

    test.each([
        'String', 'A string'
    ])(
        'returns true given a capitalized str',
        value => {
            expect(isCapitalized(value)).toBe(true);
        }
    );

    const setOfUncapitalizedLeadingWhitespaceStrings =
        setOfWhitespaceStrings.map(whitespace => `${whitespace}str`);

    const setOfCapitalizedLeadingWhitespaceStrings =
        setOfWhitespaceStrings.map(whitespace => `${whitespace}Str`);

    test.each(
        setOfUncapitalizedLeadingWhitespaceStrings
    )(
        'returns false given uncapitalized str w/ leading whitespace + trim start enabled',
        value => {
            expect(isCapitalized(value, true)).toBe(false);
        }
    );

    test.each(
        setOfCapitalizedLeadingWhitespaceStrings
    )(
        'returns true given capitalized str w/ leading whitespace + trim start enabled',
        value => {
            expect(isCapitalized(value, true)).toBe(true);
        }
    );

});

// MARK: Fn capitalize

describe(`Function: capitalize`, () => {

    test.each([
        ['', ''],
        [' ', ' '],
        ['   ', '   '],
        ['    ', '    ']
    ])(
        'returns given str when empty or only whitespace',
        (input, expected) => {
            expect(capitalize(input)).toBe(expected);
        }
    );

});

// MARK: Fn describeQuantity

describe('Function: describeQuantity', () => {

    test.each(['Some string', true, false, 'true', '2'])(
        'throws err when non-number number of things arg',
        value => {
            expect(() => describeQuantity(value as unknown as number, 'cat')).toThrow();
        }
    );

});

// MARK: Fn delimitedList

describe('Function: delimitedList', () => {

    test.each([false, 0, 2.5, {}])(
        'throws err when non-array, non-str items arg',
        value => {
            expect(() => delimitedList(value as unknown as string[])).toThrow();
        }
    )

    test.each([
        ['string', 'string'],
        ['another string', 'another string'],
        [' ', ' ']
    ])(
        'returns given str when passed as items arg',
        (input, expected) => {
            expect(delimitedList(input)).toBe(expected);
        }
    )

    it('returns empty str when empty array items arg', () => {
		expect(delimitedList([])).toBe('');
	});

    test.each([false, 0, 2.5, [], {}, undefined, null])(
        'throws err when array items arg contains a non-str: %p',
        value => {
          const itemsArg = ['a string', 'another string', value as unknown as string];
          expect(() => delimitedList(itemsArg)).toThrow();
        }
    );

});