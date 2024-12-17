import path from 'node:path';

import { basenameWithoutExtensions, normalizeFileExtension, pathHasFileExtension, replaceFileExtension } from '../../src/utility/path';
import { setOfNonBooleans, setOfNonStrings, setOfEmptyStrings } from '../resource/test-values';

// TODO fn setup
// TODO fn teardown

// TODO beforeAll -> setup()
// TODO afterAll -> teardown()

// MARK: Fn basenameWithoutExtensions

describe('Function: basenameWithoutExtensions', () => {

    const okFileName = 'manifest.yml';
    const okSingleExtsToRemove = '.yml';
    const okMultipleExtsToRemove = ['.yml', '.yaml'];
    const okFilenamesWithExtensions = ['Manifest.example.yml', 'Something.yml', 'Some Filename.yml'];

    // MARK: param fileName
    test.each(setOfNonStrings)(
        'should throw err when param fileName passed a non-string: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                value as unknown as string,
                okMultipleExtsToRemove
            )).toThrow();
        }
    );


    // MARK: param extsToRemove
    test.each([null, NaN, 42, 3.14, {}])(
        `should throw err when param extsToRemove passed an arg which is neither string nor string[]: %p`,
        value => {
            expect(() => basenameWithoutExtensions(
                okFileName,
                value as unknown as string[],
            )).toThrow();
        }
    )

    test.each([
        [['string1', 'string2', 3]],  // mixed array with a number
        [['string1', 'string2', null]], // mixed array with null
        [['string1', 'string2', undefined]], // mixed array with undefined
        [['string1', 'string2', false]], // mixed array with boolean
        [['string1', 'string2', {}]] // mixed array with an object
    ])(
        'should throw err when param extsToRemove passed a mixed-type array: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                okFileName,
                value as unknown as string[]
            )).toThrow();
        }
    )


    // MARK: param iterate
    test.each(setOfNonBooleans)(
        'should throw err when param iterate passed a non-boolean: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                okFileName,
                okMultipleExtsToRemove,
                value as unknown as boolean
            )).toThrow();
        }
    );


    // MARK: functionality
    test.each([
        {
            params: {
                fileName: 'Manifest.example.manifest.yml',
                extsToRemove: ['.yml', '.yaml', '.manifest', '.example'],
                iterate: true
            },
            expected: 'Manifest'
        }
        // TODO: More cases
    ])(
        'should, when given a valid sample case, equal expected',
        ({ params, expected }) => {
            const result = basenameWithoutExtensions(
                params.fileName,
                params.extsToRemove,
                params.iterate
            );
            expect(result).toBe(expected);
        }
    );

    test.each(okFilenamesWithExtensions)(
        'should, when param fileName given ok filenames with extensions, and param extsToRemove given wildcard string literal, should return a string whose path.extname value equals an empty string literal',
        value => {
            const result = basenameWithoutExtensions(value, '*', true);
            const actual = path.extname(result);
            const expected = '';
            expect(actual).toBe(expected);
        }
    )

});


// MARK: Fn normalizeFileExtension

describe('Function: normalizeFileExtension', () => {

    // MARK: param extname
    test.each(setOfNonStrings)(
        'should throw err when param extname passed a non-string',
        (value) => {
            expect(
                () => normalizeFileExtension(value as unknown as string)
            ).toThrow();
        }
    );

    // TODO TEST param excludeExts

    test.each([
        ['yml', '.yml'],
        ['yaml', '.yaml'],
        ['json', '.json'],
        ['jsonc', '.jsonc']
    ])(
        'should return given extname with a period prepended to it when param extname passed string which lacks period prefix: %p',
        (input, expected) => {
            expect(normalizeFileExtension(input)).toBe(expected);
        }
    );

    test.each(['.yml', '.yaml', '.json', '.jsonc'])(
        'should return given extname when param extname passed string which already has a period prefix: %p',
        (value) => {
            expect(normalizeFileExtension(value)).toBe(value);
        }
    );

});


// MARK: Fn pathHasFileExtension

describe('Function: pathHasFileExtension', () => {

    // Param: fileName

    test.each(setOfNonStrings)(
        'should throw err when param filePath passed a non-string: %p',
        (value) => {
            expect(() => pathHasFileExtension(value as unknown as string)).toThrow();
        }
    );

    // Param: fileExt

    test.each(setOfEmptyStrings)(
        'should throw err when param fileExt passed an empty string: %p',
        (value) => {
            expect(() => pathHasFileExtension('manifest.yml', value as unknown as string)).toThrow();
        }
    );

    // TODO TEST Functionality

});


// MARK: Fn replaceFileExtension

describe('Function: replaceFileExtension', () => {

    // Param: findExt
    test.each(setOfEmptyStrings)(
        'should throw err when param findExt passed an empty string: %p',
        (value) => {
            expect(() => replaceFileExtension('manifest.yml', value, '.json'));
        }
    );

    // Param: replaceExt
    test.each(setOfNonStrings)(
        'should throw err when param replaceExt passed a non-string: %p',
        (value) => {
            expect(() => replaceFileExtension(
                'manifest.yml',
                ['.yml', '.yaml'],
                value as unknown as string
            ));
        }
    );

    // Param: normalize
    test.each(setOfNonBooleans)(
        'should throw err when param normalize: %p',
        (value) => {
            expect(() => replaceFileExtension(
                'manifest.yml',
                ['.yml', '.yaml'],
                '.json',
                value as unknown as boolean
            ));
        }
    );

    // TODO TEST Functionality

});