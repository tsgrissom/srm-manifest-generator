import assert from 'node:assert';
import { describe, it } from 'node:test';

import { capitalize, countString, delimitedList } from '../src/string-utilities.js';

describe('Function: capitalize', () => {

    it('should, when passed an empty string or a string which only contains whitespace, return the given string', async (t) => {
        const inputs = ['', ' ', '   ', '   '];
        for (const input of inputs) {
            await t.test(`Subtest for input: "${input}"`, () => {
                assert.strictEqual(capitalize(input), input);
            });
        }
    });

});

describe('Function: countString', () => {

    it('should, when passed a non-number argument to number of things parameter, throw an error', async (t) => {
        const values = ['Some string', true, false, 'true', '2'];
        for (const value of values) {
            await t.test(`Subtest for input=${value}`, () => {
                assert.throws(() => countString(value));
            });
        }
    });

    // TODO: This
    // TODO: Rephrase last clause in description
    it('should, when arguments include a plural number of things and no specified plural noun, infer a plural noun', () => {

    });

});

describe('Function: getDelimitedList', () => {

    it('should, when given an items arg which is neither an array nor a string, throw an error', async (t) => {
        const values = [false, 0, 2.5, {}];
        for (const value of values) {
            await t.test(`Subtest for arg items=${value}`, () => {
                assert.throws(() => delimitedList(value));
            });
        }
    });

    it('should, when given an items arg which is a string, return that string', async (t) => {
        const values = ['Some string', 'Another str', 'Text'];
        for (const value of values) {
            const actual = delimitedList(value);
            const expected = value;
            await t.test(`Subtest for arg items=${value}`, () => {
                assert.strictEqual(actual, expected);
            });
        }
    });

    it('should, when given an empty array for items arg, return an empty string literal', () => {
        const actual = delimitedList([]);
        const expected = '';
        assert.strictEqual(actual, expected);
    });

    it('should, when given a array for items arg which contains a non-string, throw an error', async (t) => {
        const values = [false, 0, 2.5, [], {}, undefined, null];
        for (const value of values) {
            const mockItems = ['a string', 'another', value];
            await t.test(`Subtest for element of arg items=${value}`, () => {
                assert.throws(() => delimitedList(mockItems));
            });
        }
    });

    it('should not, when given an array of multiple strings for items arg and a delimiter of string literal ",", return a string that ends in a comma', () => {
        const delimiter = ',';
        const result = delimitedList([], delimiter);
        const actual = result.endsWith(delimiter);
        const expected = false;
        assert.strictEqual(actual, expected);
    });

});