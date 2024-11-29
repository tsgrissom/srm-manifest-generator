import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert';
import { before, beforeEach, after, describe, it } from 'node:test';

import chalk from 'chalk';
import YAML from 'yaml';

import Manifest from '../src/Manifest.js';
import { logDebug } from '../src/utilities.js';

const __dirname = import.meta.dirname;

let resourceFilePaths = [];

function setupTestResourceYamlFiles() {
    const mapFilePath = path.join(__dirname, 'resource', 'manifest-resources.json');
    const mapFileContents = fs.readFileSync(mapFilePath);
    const map = JSON.parse(mapFileContents);
    let count = 0;
    
    map.forEach(resourceFile => {
        const { fileName, fileContents } = resourceFile;

        if (fileName === undefined) {
            throw new Error(`Test resource map is missing a "fileName" attribute: "${mapFilePath}"`);
        }

        const areContentsEmpty = fileContents === undefined || fileContents === null || Object.keys(fileContents).length === 0;
        const writePath = path.join(__dirname, 'resource', fileName);
        const writeContents = areContentsEmpty ? '' : YAML.stringify(fileContents);

        fs.writeFileSync(writePath, writeContents);
        resourceFilePaths.push(writePath);
        count++;
    });

    logDebug(`Created ${count} test resource files`);
    resourceFilePaths.forEach(filePath => {
        logDebug(chalk.greenBright.bold('+ ') + filePath, false);
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

    logDebug(`Teardown of test resources completed: Removed ${rmCount}/${totalCount} temp files`);
}

before(() => {
    setupTestResourceYamlFiles();
});

after(() => {
    tearDownTestResourceFiles();
});

describe('Class: Manifest', () => {

    let manifestGenericValid,
        manifestGenericInvalid,
        manifestNonExistent,
        manifestNoNameAttribute,
        manifestEmpty;

    beforeEach(() => {
        manifestGenericValid    = new Manifest(path.join(__dirname, 'resource', 'manifest', 'generic-valid.yml'));
        manifestGenericInvalid  = new Manifest(path.join(__dirname, 'resource', 'manifest', 'generic-invalid.yml'));
        manifestNonExistent     = new Manifest(path.join(__dirname, 'resource', 'manifest', 'some-non-existent-file.yml'));
        manifestNoNameAttribute = new Manifest(path.join(__dirname, 'resource', 'manifest', 'no-name-attribute.yml'));
        manifestEmpty           = new Manifest(path.join(__dirname, 'resource', 'manifest', 'empty.yml'));
    });

    // Method: Manifest#doesFileExist
    describe('Method: doesFileExist()', () => {

        it('should, when instance constructed from non-existent file, return false', async () => {
            const fileExists = await manifestNonExistent.doesFileExist();
            assert.strictEqual(fileExists, false);
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const fileExists = await manifestGenericValid.doesFileExist();
            assert.strictEqual(fileExists, true);
        });

        it('should, when instance constructed from invalid manifest file, return true', async () => {
            const fileExists = await manifestGenericInvalid.doesFileExist();
            assert.strictEqual(fileExists, true);
        });
        
    });

    // Method: Manifest#getFileContents
    describe('Method: getFileContents()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manifestNonExistent.getFileContents());
        });

        it('should not, when instance constructed from valid manifest file, return a null value', async () => {
            const data = await manifestGenericValid.getFileContents();
            assert.notStrictEqual(data, null);
        });

        it('should not, when instance constructed from valid manifest file, return an empty string value', async () => {
            const data = await manifestGenericValid.getFileContents();
            assert.notStrictEqual(data, '');
        });

    });

    // TODO: Any coverage needed for getJsonObject()?

    // Method: Manifest#getNameOfFile
    describe('Method: getNameOfFile()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manifestNonExistent.getNameOfFile());
        });


        it("should, when instance constructed from existing manifest file, return a string not equal to the file's original path", async () => {
            const nameOfFile = await manifestGenericValid.getNameOfFile();
            assert.notStrictEqual(nameOfFile, manifestGenericValid.filePath);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manifestNonExistent.hasNameAttribute());
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const hasAttr = await manifestGenericValid.hasNameAttribute();
            assert.strictEqual(hasAttr, true);
        });

        it('should, when instance constructed from manifest that has no name attribute, return false', async () => {
            const hasAttr = await manifestNoNameAttribute.hasNameAttribute();
            assert.strictEqual(hasAttr, false);
        });

    });

    // Method: Manifest#getNameAttribute
    describe('Method: getNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manifestNonExistent.getNameAttribute());
        });

    });

    // Method: Manifest#getName
    describe('Method: getName()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manifestNonExistent.getName());
        });

        it(`should, when instance constructed from valid manifest file, return string literal "Some Valid Manifest"`, async () => {
            const name = await manifestGenericValid.getName();
            assert.strictEqual(name, 'Some Valid Manifest');
        });

        it("should, when instance constructed from manifest that has no name attribute, return file's basename as a string", async () => {
            const name = await manifestNoNameAttribute.getName();
            const expected = path.basename(manifestNoNameAttribute.filePath);
            assert.strictEqual(name, expected);
        });

        // TODO: Write more coverage
    });
});