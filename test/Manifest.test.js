import { describe, it } from 'node:test';
import assert from 'node:assert';

import Manifest from '../src/Manifest.js';

const filePathValidManifestFile = './test/valid-manifest.yml';
const filePathInvalidManifestFile = './test/invalid-manifest.yml';
const filePathNonExistentFile = './test/file-that-shouldnt-exist.yml';
const instanceFromValidManifestFile = new Manifest(filePathValidManifestFile);
const instanceFromInvalidManifestFile = new Manifest(filePathInvalidManifestFile);
const instanceFromNonExistentManifestFile = new Manifest(filePathNonExistentFile);

describe('Class: Manifest', () => {

    // Method: Manifest#doesFileExist
    describe('Method: doesFileExist()', () => {

        it('should return true when instance is a valid manifest', () => {
            assert(instanceFromValidManifestFile.doesFileExist(), `File does not exist: "${filePathValidManifestFile}"`);
        });
        
    });

    // Method: Manifest#getFileContents
    describe('Method: getFileContents()', () => {

        it('should throw an error if the file does not exist', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getFileContents());
        });

        it('should not return a null value when instance is a valid manifest', async () => {
            const data = await instanceFromValidManifestFile.getFileContents();
            assert.notStrictEqual(data, null);
        });

        it('should not return an empty str value when instance is a valid manifest', async () => {
            const data = await instanceFromValidManifestFile.getFileContents();
            assert.notStrictEqual(data, '');
        });

    });

    // TODO: Any coverage needed for getJsonObject()?

    // Method: Manifest#getNameOfFile
    describe('Method: getNameOfFile()', () => {

        it('should throw error if the file does not exist', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getSourceName());
        });

        it('should return a str not equal to the full valid manifest path when instance is the valid manifest', async () => {
            const name = await instanceFromValidManifestFile.getNameOfFile();
            const expected = filePathValidManifestFile;

            assert.notStrictEqual(name, expected, `Values were equal:\nname: ${name}\nexpected: ${expected}`);
        });
    
    });

    // Method: Manifest#getSourceName
    describe('Method: getSourceName()', () => {

        it('should throw error if the file does not exist', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.getSourceName());
        });

        it('should return str literal "A Valid Manifest" when the file is the sample valid manifest', async () => {
            const name = await instanceFromValidManifestFile.getSourceName();
            assert.strictEqual(name, 'A Valid Manifest');
        });

        // TODO: Write more coverage
    });
});