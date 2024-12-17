import { capitalize, delimitedList, describeQuantity } from '../../src/utility/string';

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
        (value) => {
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