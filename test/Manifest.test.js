import { describe, it } from 'node:test';
import assert from 'node:assert';

import Manifest from '../src/Manifest.js';
import path from 'node:path';

// Test resources
const filePathValidManifestFile = './test/valid-manifest.yml',
      filePathInvalidManifestFile = './test/invalid-manifest.yml',
      filePathNonExistentManifestFile = './test/file-that-shouldnt-exist.yml';
const instanceFromValidManifestFile = new Manifest(filePathValidManifestFile),
      instanceFromInvalidManifestFile = new Manifest(filePathInvalidManifestFile),
      instanceFromNonExistentManifestFile = new Manifest(filePathNonExistentManifestFile);
const expectedNameAttributeFromValidManifestFile = 'A Valid Manifest';

describe('Class: Manifest', () => {

    // Method: Manifest#doesFileExist
    describe('Method: doesFileExist()', () => {

        it('should, when instance constructed from non-existent file, return false', async () => {
            const fileExists = await instanceFromNonExistentManifestFile.doesFileExist();
            assert.strictEqual(fileExists, false);
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const fileExists = await instanceFromValidManifestFile.doesFileExist();
            assert.strictEqual(fileExists, true);
        });

        it('should, when instance constructed from invalid manifest file, return true', async () => {
            const fileExists = await instanceFromInvalidManifestFile.doesFileExist();
            assert.strictEqual(fileExists, true);
        });
        
    });

    // Method: Manifest#getFileContents
    describe('Method: getFileContents()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getFileContents());
        });

        it('should not, when instance constructed from valid manifest file, return a null value', async () => {
            const data = await instanceFromValidManifestFile.getFileContents();
            assert.notStrictEqual(data, null);
        });

        it('should not, when instance constructed from valid manifest file, return an empty string value', async () => {
            const data = await instanceFromValidManifestFile.getFileContents();
            assert.notStrictEqual(data, '');
        });

    });

    // TODO: Any coverage needed for getJsonObject()?

    // Method: Manifest#getNameOfFile
    describe('Method: getNameOfFile()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getNameOfFile());
        });


        it("should, when instance constructed from valid manifest file, return a string not equal to the file's original path", async () => {
            const name = await instanceFromValidManifestFile.getNameOfFile();
            const expected = filePathValidManifestFile;

            assert.notStrictEqual(name, expected, `Values were equal:\nname: ${name}\nexpected: ${expected}`);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.hasNameAttribute());
        });

    });

    // Method: Manifest#getNameAttribute
    describe('Method: getNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getNameAttribute());
        });

    });

    // Method: Manifest#getName
    describe('Method: getName()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getName());
        });

        it(`should, when instance constructed from valid manifest file, return string literal "${expectedNameAttributeFromValidManifestFile}"`, async () => {
            const name = await instanceFromValidManifestFile.getName();
            assert.strictEqual(name, expectedNameAttributeFromValidManifestFile);
        });

        it("should, when instance constructed from invalid manifest file, return file's basename as a string", async () => {
            const name = await instanceFromInvalidManifestFile.getName();
            const expected = path.basename(filePathInvalidManifestFile);
            assert.strictEqual(name, expected);
        });

        // TODO: Write more coverage
    });
});