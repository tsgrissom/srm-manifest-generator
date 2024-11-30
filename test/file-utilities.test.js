import path from 'node:path';
import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { setOfBooleans, setOfEmptyAndWhitespaceStrings, setOfFalsy, setOfNonArrays, setOfNonStrings, unionOfNonArraysAndNonStrings } from './test-values.js';

import { basenameWithoutExtensions, normalizeFileExtension, replaceFileExtension } from '../src/file-utilities.js';

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

describe('File: file-utilities.js', () => {

    // MARK: normalizeFileExtension
    describe('Function: normalizeFileExtension', () => {

        it('should, when passed a non-string argument, throw an error', async (t) => {
            for (const value of setOfNonStrings) {
                await t.test(`Subtest for input: ${value}`, () => {
                    assert.throws(() => normalizeFileExtension(value));
                });
            }
        });
    
        it('should, when passed a string which is not in extension form, return the expected string"', async (t) => {
            const cases = [{input: 'yml', expected: '.yml'},{input: 'json', expected: '.json'}];
            for (const value of cases) {
                const {input, expected} = value;
                await t.test(`Subtest for input: ${input}`, () => {
                    const actual = normalizeFileExtension(input);
                    assert.strictEqual(actual, expected);
                });
            }
        });

        it('should, when passed a string which is already in extension form, return the same string', async (t) => {
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

    // MARK: replaceFileExtension
    describe('Function: replaceFileExtension', () => {

        // Arg: fileName
        it('should, when passed a non-string fileName arg, throw an error', async (t) => {
            for (const value of setOfNonStrings) {
                await t.test(`Subtest for fileName=${value}`, () => {
                    assert.throws(() => replaceFileExtension(value, ['.yml', '.yaml'], '.json'));
                });
            }
        });

        // Arg: findExt
        it('should, when passed a findExt arg which is neither a string nor an array, throw an error', async (t) => {
            for (const value of unionOfNonArraysAndNonStrings) {
                await t.test(`Subtest for findExt=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', value, '.json'));
                })
            }
        })
        it('should, when passed an empty or whitespace-only string, throw an error', async (t) => {
            for (const value of setOfEmptyAndWhitespaceStrings) {
                await t.test(`Subtest for findExt="${value}"`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', value, '.json'));
                })
            }
        })

        // Arg: replaceExt
        it('should, when passed a non-string replaceExt arg, throw an error', async (t) => {
            for (const value of setOfNonStrings) {
                await t.test(`Subtest for replaceExt=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', ['.yml', '.yaml'], value));
                })
            }
        })

        // Arg: normalize
        it('should, when passed a non-boolean normalize arg, throw an error', async (t) => {
            for (const value of setOfBooleans) {
                await t.test(`Subtest for normalize=${value}`, () => {
                    assert.throws(() => replaceFileExtension('file.yaml', ['.yml', '.yaml'], '.json', value));
                })
            }
        })

        // TODO TEST Functionality

    });
    
    // MARK: basenameWithoutExtensions
    describe('Function: basenameWithoutExtensions', () => {
    
        it('should, when passed a non-string fileName arg, throw an error', async (t) => {
            for (const value of setOfNonStrings) {
                await t.test(`Subtest for input: ${value}`, () => {
                    assert.throws(() => basenameWithoutExtensions(value));
                });
            }
        });
    
        it('should, when passed a non-boolean iterate arg, throw an error', async (t) => {
            const values = ['Some string', 123, '123', [], {}];
            for (const value of values) {
                await t.test(`Subtest for input: ${value}`, () => {
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
    
            for (const c of cases) {
                const {fileName, extensionsToRemove, iterate, expected} = c;
                await t.test(`Subtest for arguments fileName=${fileName} extensionsToRemove=${extensionsToRemove}`, () => {
                    const actual = basenameWithoutExtensions(fileName, extensionsToRemove, iterate);
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
        it('should, when passed a wildcard extensionsToRemove argument and iterate is true, have a path.extname equal to an empty string literal', async (t) => {
            const values = ['Manifest.example.manifest.yml', 'Manifest.yml', 'Some Output.json'];
    
            for (const value of values) {
                await t.test(`Subtest for fileName=${value}:`, () => {
                    const result = basenameWithoutExtensions(value, '*', true);
                    const actual = path.extname(result);
                    const expected = '';
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
    });

});