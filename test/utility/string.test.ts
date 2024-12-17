import { capitalize, delimitedList, describeQuantity, isCapitalized } from '../../src/utility/string';
import { setOfEmptyStrings, setOfWhitespaceStrings } from '../resource/test-values';

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
        'returns false given an uncapitalized str w/ leading whitespace + trim start enabled',
        value => {
            expect(isCapitalized(value, true)).toBe(false);
        }
    );

    test.each(
        setOfCapitalizedLeadingWhitespaceStrings
    )(
        'returns true given a capitalized str w/ leading whitespace + trim start enabled',
        value => {
            expect(isCapitalized(value, true)).toBe(true);
        }
    );

});

describe(`Function: capitalize`, () => {

    test.each([
        ['', ''],
        [' ', ' '],
        ['   ', '   '],
        ['    ', '    ']
    ])(
        'returns given str when it is empty or only whitespace',
        (input, expected) => {
            expect(capitalize(input)).toBe(expected);
        }
    )

})

describe('Function: describeQuantity', () => {

    test.each(['Some string', true, false, 'true', '2'])(
        'throws err given non-number number of things arg',
        value => {
            expect(() => describeQuantity(value as unknown as number, 'cat')).toThrow();
        }
    )

})

describe('Function: delimitedList', () => {

    test.each([false, 0, 2.5, {}])(
        'throws err given non-array, non-str arg to items param',
        value => {
            expect(() => delimitedList(value as unknown as string[])).toThrow();
        }
    )

    test.each([
        ['string', 'string'],
        ['another string', 'another string'],
        [' ', ' ']
    ])(
        'returns given str when passed to items param',
        (input, expected) => {
            expect(delimitedList(input)).toBe(expected);
        }
    )

    it('should return empty str given empty array arg to items param', () => {
		expect(delimitedList([])).toBe('');
	});

    test.each([false, 0, 2.5, [], {}, undefined, null])(
        'throws err given items param which contains a non-str: %p',
        value => {
          const itemsArg = ['a string', 'another string', value as unknown as string];
          expect(() => delimitedList(itemsArg)).toThrow();
        }
    );

});