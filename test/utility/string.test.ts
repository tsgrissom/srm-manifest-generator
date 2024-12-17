import { capitalize, delimitedList, describeQuantity, isCapitalized } from '../../src/utility/string';
import { setOfEmptyStrings, setOfWhitespaceStrings } from '../resource/test-values';

describe('Function: isCapitalized', () => {

    test.each(setOfEmptyStrings)(
        'should return false when given an empty string',
        value => {
            expect(isCapitalized(value)).toBe(false);
        }
    );

    test.each([
        'string', '2nd', ' some string'
    ])(
        'should return false when given an uncapitalized string',
        value => {
            expect(isCapitalized(value)).toBe(false);
        }
    );

    test.each([
        'String', 'A string'
    ])(
        'should return true when given a capitalize dstring',
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
        'should return false when trim start is enabled and given a uncapitalized string padded with leading whitespace: %p',
        value => {
            expect(isCapitalized(value, true)).toBe(false);
        }
    );

    test.each(
        setOfCapitalizedLeadingWhitespaceStrings
    )(
        'should return false when trim start is enabled and given a uncapitalized string padded with leading whitespace: %p',
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
        'should, when passed an empty string or a string which only contains whitespace, return the given string',
        (input, expected) => {
            expect(capitalize(input)).toBe(expected);
        }
    )

})

describe('Function: describeQuantity', () => {

    test.each(['Some string', true, false, 'true', '2'])(
        'should, when passed a non-number argument to number of things parameter, throw an error',
        value => {
            expect(() => describeQuantity(value as unknown as number, 'cat')).toThrow();
        }
    )

})

describe('Function: delimitedList', () => {

    test.each([false, 0, 2.5, {}])(
        'should, when given an items arg which is neither an array nor a string, throw an error',
        (value) => {
            expect(() => delimitedList(value as unknown as string[])).toThrow();
        }
    )

    test.each([
        ['string', 'string'],
        ['another string', 'another string'],
        [' ', ' ']
    ])(
        'should, when given an items arg which is a string, return that string',
        (input, expected) => {
            expect(delimitedList(input)).toBe(expected);
        }
    )

    it('should, when given an empty array as items arg, return an empty string literal', () => {
        expect(delimitedList([])).toBe('');
    });

    test.each([false, 0, 2.5, [], {}, undefined, null])(
        'should throw an error when given an items arg which contains a non-string: %p',
        (value) => {
          const itemsArg = ['a string', 'another string', value as unknown as string];
          expect(() => delimitedList(itemsArg)).toThrow();
        }
    );

});