import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';

import YAML from 'yaml';

import Manifest from '../src/Manifest.js';

// Test resources
const filePathValidManifestFile = './test/valid-manifest.yml',
      filePathInvalidManifestFile = './test/invalid-manifest.yml',
      filePathNonExistentManifestFile = './test/file-that-shouldnt-exist.yml';
const instanceFromValidManifestFile = new Manifest(filePathValidManifestFile),
      instanceFromInvalidManifestFile = new Manifest(filePathInvalidManifestFile),
      instanceFromNonExistentManifestFile = new Manifest(filePathNonExistentManifestFile);
const expectedNameAttributeFromValidManifestFile = 'A Valid Manifest';

let resourceFilePaths = [];

function setupTestResourceYamlFiles() {
    const mapFilePath = './test/resource/_yaml-resources.json';
    const mapFileContents = fs.readFileSync(mapFilePath);
    const map = JSON.parse(mapFileContents);
    
    map.forEach(resourceFile => {
        const { fileName, fileContents } = resourceFile;

        if (fileName === undefined) {
            throw new Error(`Test resource map is missing a "fileName" attribute: "${mapFilePath}"`);
        }

        const areContentsEmpty = fileContents === undefined || fileContents === null || Object.keys(fileContents).length === 0;
        const writePath = `./test/resource/${fileName}`;
        const writeContents = areContentsEmpty ? '' : YAML.stringify(fileContents);

        fs.writeFileSync(writePath, writeContents);
        console.log(`Created test resource temp file: "${writePath}"`);
        resourceFilePaths.push(writePath);
    });
}

function tearDownTestResourceFiles() {
    const totalCount = resourceFilePaths.length;
    let rmCount = 0;

    resourceFilePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            rmCount++;
            fs.unlinkSync(filePath);
        }
    });
    resourceFilePaths = [];

    // console.log(`Tear down test resources complete: Removed ${rmCount} files / ${totalCount} cached file paths`);
    console.log(`Tear down test resources complete: Removed ${rmCount}/${totalCount} temp files`);
}

before(() => {
    setupTestResourceYamlFiles();
});

after(() => {
    tearDownTestResourceFiles();
});

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


        it("should, when instance constructed from existing manifest file, return a string not equal to the file's original path", async () => {
            const nameOfFile = await instanceFromValidManifestFile.getNameOfFile();
            assert.notStrictEqual(nameOfFile, instanceFromValidManifestFile.filePath);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => instanceFromNonExistentManifestFile.hasNameAttribute());
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const hasAttr = await instanceFromValidManifestFile.hasNameAttribute();
            assert.strictEqual(hasAttr, true);
        });

        it('should, when instance constructed from invalid manifest file, return false', async () => {
            const hasAttr = await instanceFromInvalidManifestFile.hasNameAttribute();
            assert.strictEqual(hasAttr, false);
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