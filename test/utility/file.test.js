import path from 'node:path';
import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import {
    setOfNonBooleans,
    setOfNonStrings,
    setOfWhitespaceStrings,
    unionOfNonArraysAndNonStrings 
} from '../resource/test-values.js';
import {
    basenameWithoutExtensions,
    normalizeFileExtension,
    pathHasFileExtension,
    replaceFileExtension
} from '../../dist/utility/file.js';

function setup() {
    // TODO Some files for real file testing
}

function teardown() {

}

before(() => {
    setup();
});

after(() => {
    teardown();
});

describe('File: utility/file.js', () => {

    // MARK: normalizeFileExtension
    describe('Function: normalizeFileExtension', () => {

        it('should throw an error when parameter extname passed a non-string', async (t) => {
            for (const value of setOfNonStrings) {
                await t.test(`Subtest for input: ${value}`, () => {
                    assert.throws(() => normalizeFileExtension(value));
                });
            }
        });
    
        it('should, when parameter extname passed a string which is not in extension form, return the extname argument with a dot prepended"', async (t) => {
            const cases = [{input: 'yml', expected: '.yml'},{input: 'json', expected: '.json'}];
            for (const value of cases) {
                const {input, expected} = value;
                await t.test(`Subtest for input: ${input}`, () => {
                    const actual = normalizeFileExtension(input);
                    assert.strictEqual(actual, expected);
                });
            }
        });

        it('should, when parameter extname passed a string which is already in extension form, return the extname', async (t) => {
            const values = ['.yml', '.json', '.txt'];
            for (const value of values) {
                await t.test(`Subtest for input: ${value}`, () => {
                    const actual = normalizeFileExtension(value);
                    const expected = value;
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
    });

    // MARK: pathHasFileExtension
    describe('Function: pathHasFileExtension', () => {
        it('should throw an error when parameter filePath passed a non-string', async (t) => {
            for (const [i, value] of setOfNonStrings.entries()) {
                await t.test(`Subtest #${i+1} for filePath=${value}`, () => {
                    assert.throws(() => pathHasFileExtension(value));
                });
            }
        });

        it('should throw an error when parameter fileExt passed an empty string', () => {
            assert.throws(() => pathHasFileExtension('manifest.yml', ''));
        });

        it('should throw an error when parameter fileExt passed a whitespace-only string', async (t) => {
            for (const [i, value] of setOfWhitespaceStrings.entries()) {
                await t.test(`Subtest #${i+1} for fileExt=${value}`, () => {
                    assert.throws(() => pathHasFileExtension('manifest.yml', value));
                });
            }
        });

        // TODO TEST Functionality
    });

    // MARK: replaceFileExtension
    describe('Function: replaceFileExtension', () => {
        // Parameter: fileName
        it('should throw an error when parameter fileName passed a non-string', async (t) => {
            for (const [i, value] of setOfNonStrings.entries()) {
                await t.test(`Subtest #${i+1} for fileName=${value}`, () => {
                    assert.throws(() => replaceFileExtension(value, ['.yml', '.yaml'], '.json'));
                });
            }
        });

        // Parameter: findExt
        it('should throw an error when findExt parameter passed an empty string', () => {
            assert.throws(() => replaceFileExtension('file.yaml', '', '.json'));
        });

        it('should throw an error when findExt parameter passed a whitespace-only string', async (t) => {
            for (const [i, value] of setOfWhitespaceStrings.entries()) {
                await t.test(`Subtest #${i+1} for findExt=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', value, '.json'));
                });
            }
        });

        // Parameter: replaceExt
        it('should throw an error when replaceExt parameter passed a non-string', async (t) => {
            for (const [i, value] of setOfNonStrings.entries()) {
                await t.test(`Subtest #${i+1} for replaceExt=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', ['.yml', '.yaml'], value));
                });
            }
        });

        // Arg: normalize
        it('should throw an error when parameter normalize passed a non-boolean', async (t) => {
            for (const [i, value] of setOfNonBooleans.entries()) {
                await t.test(`Subtest #${i+1} for normalize=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', ['.yml', '.yaml'], '.json', value));
                });
            }
        });

        // TODO TEST Functionality

    });
    
    // MARK: basenameWithoutExtensions
    describe('Function: basenameWithoutExtensions', () => {
    
        it('should throw an error when parameter fileName passed a non-string', async (t) => {
            for (const [i, value] of setOfNonStrings.entries()) {
                await t.test(`Subtest #${i+1} for arg fileName=${value}`, () => {
                    assert.throws(() => basenameWithoutExtensions(value));
                });
            }
        });

        it('should throw an error when parameter extensionsToRemove passed arg which is neither a string nor an array, throw an error', async (t) => {
            for (const [i, value] of unionOfNonArraysAndNonStrings.entries()) {
                await t.test(`Subtest #${i+1} for arg extensionsToRemove=${value}`);
            }
        });
    
        it('should, when passed a non-boolean iterate arg, throw an error', async (t) => {
            const values = ['Some string', 123, '123', [], {}];
            for (const [i, value] of values.entries()) {
                await t.test(`Subtest #${i+1} for arg iterate=${value}`, () => {
                    assert.throws(() => basenameWithoutExtensions(value));
                });
            }
        });
    
        it('should, when passed test fileName, desired file extensions, with iterate enabled, equal expected', async (t) => {
            const cases = [
                {
                    fileName: 'Manifest.example.manifest.yml',
                    extensionsToRemove: ['.yml', '.yaml', '.manifest', '.example'],
                    iterate: true,
                    expected: 'Manifest'
                } // TODO More cases
            ];
    
            for (const [i, data] of cases.entries()) {
                const {fileName, extensionsToRemove, iterate, expected} = data;
                await t.test(`Subtest #${i+1} for args fileName=${fileName} extensionsToRemove=${extensionsToRemove}`, () => {
                    const actual = basenameWithoutExtensions(fileName, extensionsToRemove, iterate);
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
        it('should, when passed a wildcard extensionsToRemove argument and iterate is true, have a path.extname equal to an empty string literal', async (t) => {
            const values = ['Manifest.example.manifest.yml', 'Manifest.yml', 'Some Output.json'];
    
            for (const [i, value] of values.entries()) {
                await t.test(`Subtest #${i+1} for fileName=${value}:`, () => {
                    const result = basenameWithoutExtensions(value, '*', true);
                    const actual = path.extname(result);
                    const expected = '';
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
    });

});