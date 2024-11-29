import path from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getFileBasenameWithoutExtensions, normalizeFileExtension } from '../src/file-utilities.js';

describe('File: file-utilities.js', () => {

    describe('Function: normalizeFileExtension', () => {

        it('should, when passed a non-string argument, throw an error', async (t) => {
            const cases = [undefined, null, [], {}];
            for (const value of cases) {
                await t.test(`Subtest for input: ${value}`, () => {
                    assert.throws(() => normalizeFileExtension(value));
                });
            }
        });
    
        it('should, when passed a string which is not in extension form, return the expected string"', async (t) => {
            const cases = [
                {
                    input: 'yml',
                    expected: '.yml'
                },
                {
                    input: 'json',
                    expected: '.json'
                }
            ];

            for (const value of cases) {
                const {input, expected} = value;
                await t.test(`Subtest for input: ${input}`, () => {
                    const actual = normalizeFileExtension(input);
                    assert.strictEqual(actual, expected);
                });
            }
        });

        it('should, when passed a string which is already in extension form, return the same string', async (t) => {
            const cases = ['.yml', '.json', '.txt'];
            for (const [value, index] of cases) {
                await t.test(`Subtest #${index} for input: ${value}`, () => {
                    const actual = normalizeFileExtension(value);
                    const expected = value;
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
    });
    
    describe('Function: getFileBasenameWithoutExtensions', () => {
    
        it('should, when passed a non-string fileName argument, throw an error', async (t) => {
            const cases = [[], {}];
            for (const c of cases) {
                await t.test(`Subtest for input: ${c}`, () => {
                    assert.throws(() => getFileBasenameWithoutExtensions(c));
                });
            }
        });
    
        it('should, when passed a non-boolean iterate argument, throw an error', async (t) => {
            const cases = ['Some string', 123, '123', [], {}];
            for (const c of cases) {
                await t.test(`Subtest for input: ${c}`, () => {
                    assert.throws(() => getFileBasenameWithoutExtensions(c));
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
                    const actual = getFileBasenameWithoutExtensions(fileName, extensionsToRemove, iterate);
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
        it('should, when passed a wildcard extensionsToRemove argument and iterate is true, have a path.extname equal to an empty string literal', async (t) => {
            const values = ['Manifest.example.manifest.yml', 'Manifest.yml', 'Some Output.json'];
    
            for (const value of values) {
                await t.test(`Subtest for fileName=${value}:`, () => {
                    const value = getFileBasenameWithoutExtensions(value, '*', true);
                    const actual = path.extname(value);
                    const expected = '';
                    assert.strictEqual(actual, expected);
                });
            }
        });
    
    });

});