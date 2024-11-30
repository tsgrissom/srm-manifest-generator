import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert';
import { before, beforeEach, after, describe, it } from 'node:test';

import chalk from 'chalk';
import tmp from 'tmp';
import yaml from 'yaml';

import Manifest from '../src/Manifest.js';
import { logDebug } from '../src/utilities.js';
import { json } from 'node:stream/consumers';

const __dirname = import.meta.dirname;
const dirTestTmp = path.join(__dirname, 'tmp');
const dirScopeTmpPrefix = 'Manifest.test.js';

console.log(chalk.red(`pathTestResources: ${dirTestTmp}`));

const replaceYamlExtensionWithJson = (fileName) => {
    if (typeof fileName !== 'string')
        throw new Error(`Cannot replace file extension of non-string arg: ${fileName}`);

    if (fileName.endsWith('.yml')) {
        return path.basename(fileName, '.yml');
    } else if (fileName.endsWith('.yaml')) {
        return path.basename(fileName, '.yaml');
    }

    return fileName;
};

let tmpDir,
    tmpDirManifests,
    tmpDirManRootDir,
    tmpDirManOutput,
    tmpDirManExecutables;

let tmpFileGenValid,
    tmpFileGenInvalid,
    tmpFileNonExistent,
    tmpFileEmpty,
    tmpFileNoNameAttr;
let manGenValid,
    manGenInvalid,
    manNonExistent,
    manEmpty,
    manNoNameAttr;

let tmpFileMockValidExecutable,
    tmpFileMockInvalidExecutable;

function tmpSubdir(prefix) {
    return tmp.dirSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: dirScopeTmpPrefix,
        prefix: prefix
    });
}

function tmpManifestYamlFileSync(prefix = 'manifest') {
    return tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpDirManifests.name,
        prefix: prefix,
        postfix: '.manifest.yml',
    });
}

function setupDirs() {
    tmpDir = tmp.dirSync({
        keep: true,
        tmpdir: dirTestTmp,
        name: dirScopeTmpPrefix
    });
    tmpDirManifests = tmpSubdir('manifests');
    tmpDirManRootDir = tmpSubdir('root');
    tmpDirManOutput = tmpSubdir('output');
    tmpDirManExecutables = tmpSubdir('executables');

    logDebug(`Setup of Manifest dir test resource completed`);
}

function setupMockManifestYmlFiles() {
    {
        tmpFileGenValid = tmpManifestYamlFileSync('generic-valid');
        const content = {
            name: "Some Valid Manifest",
            root: `${tmpDirManRootDir.name}`,
            output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileGenValid.name))}`,
            entries: [{name: "A Fake Game", exec: tmpFileMockValidExecutable.name}]
        };
        fs.writeFileSync(tmpFileGenValid.name, yaml.stringify(content));
        manGenValid = new Manifest(tmpFileGenValid.name, content);
    }

    {
        tmpFileGenInvalid = tmpManifestYamlFileSync('generic-invalid');
        const content = {
            name: "Some Invalid Manifest",
            // root: `${tmpDirManRootDir.name}`,
            // output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileGenInvalid.name))}`,
            entries: false
        };
        fs.writeFileSync(tmpFileGenInvalid.name, yaml.stringify(content));
        manGenInvalid = new Manifest(tmpFileGenInvalid.name, content);
    }

    {
        tmpFileNonExistent = tmpManifestYamlFileSync('non-existent');
        const content = {
            name: "Some Non-Existent Manifest",
            root: `${tmpDirManRootDir.name}`,
            output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileNonExistent.name))}`,
            entries: [{name: "A Fake Game", exec: tmpFileMockValidExecutable.name}]
        }
        fs.writeFileSync(tmpFileNonExistent.name, content);
        manNonExistent = new Manifest(tmpFileNonExistent.name, content);
        tmpFileNonExistent.removeCallback();
    }

    {
        tmpFileEmpty = tmpManifestYamlFileSync('empty');
        fs.writeFileSync(tmpFileEmpty.name, '');
        manEmpty = new Manifest(tmpFileEmpty.name, {});
    }

    {
        tmpFileNoNameAttr = tmpManifestYamlFileSync('no-name-attribute');
        const content = {
            root: `${tmpDirManRootDir.name}`,
            output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileNoNameAttr.name))}`,
            entries: [{name: "A Fake Game", exec: tmpFileMockValidExecutable.name}]
        };
        fs.writeFileSync(tmpFileNoNameAttr.name, yaml.stringify(content));
        manNoNameAttr = new Manifest(tmpFileNoNameAttr.name, content);
    }

    logDebug(`Setup of YAML test resources completed`);
}

function setupMockExecutables() {
    tmpFileMockValidExecutable = tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpDirManExecutables.name,
        prefix: 'valid-exec',
        postfix: '.exe'
    });
    tmpFileMockInvalidExecutable = tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpDirManExecutables.name,
        prefix: 'invalid-exec',
        postfix: '.txt'
    });

    logDebug(`Setup of mock executable test resources completed`);
}

function teardownMockExecutables() {
    tmpFileMockValidExecutable.removeCallback();
    tmpFileMockInvalidExecutable.removeCallback();

    logDebug(`Teardown of mock executable test resources completed`);
}

function teardownMockManifestYmlFiles() {
    tmpFileGenValid.removeCallback();
    tmpFileGenInvalid.removeCallback();
    tmpFileEmpty.removeCallback();
    tmpFileNoNameAttr.removeCallback();

    logDebug(`Teardown of YAML test resources completed`);
}

function teardownDirs() {
    tmpDirManExecutables.removeCallback();
    tmpDirManOutput.removeCallback();
    tmpDirManRootDir.removeCallback();
    tmpDirManifests.removeCallback();
    tmpDir.removeCallback();

    logDebug(`Teardown of manifest directory test resources completed`);
}

function setup() {
    setupDirs();
    setupMockExecutables();
    setupMockManifestYmlFiles();

    console.log(`Test setup completed`);
}

function teardown() {
    teardownMockExecutables();
    teardownMockManifestYmlFiles();
    teardownDirs();

    console.log(`Test teardown completed`);
}

before(() => {
    setup();
});

after(() => {
    teardown();
});

describe('Class: Manifest', () => {

    // Method: Manifest#doesFileExist
    describe('Method: doesFileExist()', () => {

        it('should, when instance constructed from non-existent file, return false', async () => {
            const fileExists = await manNonExistent.doesFileExist();
            assert.strictEqual(fileExists, false);
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const fileExists = await manGenValid.doesFileExist();
            assert.strictEqual(fileExists, true);
        });

        it('should, when instance constructed from invalid manifest file, return true', async () => {
            const fileExists = await manGenInvalid.doesFileExist();
            assert.strictEqual(fileExists, true);
        });
        
    });

    // Method: Manifest#getFileContents
    describe('Method: getFileContents()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manNonExistent.getFileContents());
        });

        it('should not, when instance constructed from valid manifest file, return a null value', async () => {
            const data = await manGenValid.getFileContents();
            assert.notStrictEqual(data, null);
        });

        it('should not, when instance constructed from valid manifest file, return an empty string value', async () => {
            const data = await manGenValid.getFileContents();
            assert.notStrictEqual(data, '');
        });

    });

    // TODO: Any coverage needed for getJsonObject()?

    // Method: Manifest#getNameOfFile
    describe('Method: getNameOfFile()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manNonExistent.getNameOfFile());
        });


        it("should, when instance constructed from existing manifest file, return a string not equal to the file's original path", async () => {
            const nameOfFile = await manGenValid.getNameOfFile();
            assert.notStrictEqual(nameOfFile, manGenValid.filePath);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manNonExistent.hasNameAttribute());
        });

        it('should, when instance constructed from valid manifest file, return true', async () => {
            const hasAttr = await manGenValid.hasNameAttribute();
            assert.strictEqual(hasAttr, true);
        });

        it('should, when instance constructed from manifest that has no name attribute, return false', async () => {
            const hasAttr = await manNoNameAttr.hasNameAttribute();
            assert.strictEqual(hasAttr, false);
        });

    });

    // Method: Manifest#getNameAttribute
    describe('Method: getNameAttribute()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manNonExistent.getNameAttribute());
        });

    });

    // Method: Manifest#getName
    describe('Method: getName()', () => {

        it('should, when instance constructed from non-existent file, throw an error', async () => {
            await assert.rejects(() => manNonExistent.getName());
        });

        it(`should, when instance constructed from valid manifest file, return string literal "Some Valid Manifest"`, async () => {
            const name = await manGenValid.getName();
            assert.strictEqual(name, 'Some Valid Manifest');
        });

        it("should, when instance constructed from manifest that has no name attribute, return file's basename as a string", async () => {
            const name = await manNoNameAttr.getName();
            const expected = path.basename(manNoNameAttr.filePath);
            assert.strictEqual(name, expected);
        });

        // TODO: Write more coverage
    });

});