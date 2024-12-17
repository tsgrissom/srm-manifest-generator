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
    const okExtsToRemove = ['.yml', '.yaml'];
    const okFilenamesWithExtensions = ['Manifest.example.yml', 'Something.yml', 'Some Filename.yml'];

    // MARK: param fileName
    test.each(setOfNonStrings)(
        'throws err when non-string fileName arg: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                value as unknown as string,
                okExtsToRemove
            )).toThrow();
        }
    );


    // MARK: param extsToRemove
    test.each([null, NaN, 42, 3.14, {}])(
        'throws err when non-str, non-str array extsToRemove arg: %p',
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
        'throws err when mixed-type array extsToRemove arg: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                okFileName,
                value as unknown as string[]
            )).toThrow();
        }
    )


    // MARK: param iterate
    test.each(setOfNonBooleans)(
        'throws err when non-boolean iterate arg: %p',
        value => {
            expect(() => basenameWithoutExtensions(
                okFileName,
                okExtsToRemove,
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
        'returns expected given valid manifest file name',
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
        'returns str whose path.basename equals empty str when filenames w/ exts given as fileName arg + wildcard given as extsToRemove arg',
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
        'throws err when param extname passed a non-str',
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
        'returns given str w/ prepended period char when extname given str w/o period prefix: %p',
        (input, expected) => {
            expect(normalizeFileExtension(input)).toBe(expected);
        }
    );

    test.each(['.yml', '.yaml', '.json', '.jsonc'])(
        'returns given str when extname given str w/ period prefix: %p',
        (value) => {
            expect(normalizeFileExtension(value)).toBe(value);
        }
    );

});


// MARK: Fn pathHasFileExtension

describe('Function: pathHasFileExtension', () => {

    // Param: fileName

    test.each(setOfNonStrings)(
        'throws err when non-str filePath arg: %p',
        (value) => {
            expect(() => pathHasFileExtension(value as unknown as string)).toThrow();
        }
    );

    // Param: fileExt

    test.each(setOfEmptyStrings)(
        'throws err when empty str fileExt arg: %p',
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
        'throws err when empty str findExt arg: %p',
        (value) => {
            expect(() => replaceFileExtension('manifest.yml', value, '.json'));
        }
    );

    // Param: replaceExt
    test.each(setOfNonStrings)(
        'throws err when non-str replaceExt arg: %p',
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
        'throws err when non-boolean normalize arg: %p',
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