import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';

import tmp from 'tmp';
import yaml from 'yaml';

import Manifest from '../src/Manifest.js';

import { logDebug } from '../src/util/utilities.js';
import { replaceFileExtension } from '../src/util/file-utilities.js';

const __dirname = import.meta.dirname;
const dirTestTmp = path.join(__dirname, 'tmp');
const dirScopeTmpPrefix = 'Manifest.test.js';

const yamlToJsonExt = (fileName) => {
    return replaceFileExtension(fileName, ['.yml', '.yaml'], '.json');
};

let tmpDir,
    tmpSubdirManifests,
    tmpSubdirManRoot,
    tmpSubdirManOutput,
    tmpSubdirExecutables;

let tmpManifestFileGenValid,
    tmpManifestFileGenInvalid,
    tmpManifestFileNonExistent,
    tmpManifestFileEmpty,
    tmpManifestFileNoNameAttr;
let manifestGenValid,
    manifestGenInvalid,
    manifestNonExistent,
    manifestEmpty,
    manifestNoNameAttr;

let tmpFileValidExecExt,
    tmpFileInvalidExecExt;

function makeTmpSubdir(prefix) {
    return tmp.dirSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpDir.name,
        prefix: prefix
    });
}

function makeTmpManifestYml(prefix = 'manifest') {
    return tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpSubdirManifests.name,
        prefix: prefix,
        postfix: '.manifest.yml',
    });
}

function setupFolders() {
    tmpDir = tmp.dirSync({
        keep: true,
        tmpdir: dirTestTmp,
        prefix: dirScopeTmpPrefix
    });
    tmpSubdirManifests = makeTmpSubdir('manifests');
    tmpSubdirManRoot = makeTmpSubdir('root');
    tmpSubdirManOutput = makeTmpSubdir('output');
    tmpSubdirExecutables = makeTmpSubdir('executables');
    logDebug(`Test resource setup finished: Manifest.test.js folders`);
}

function teardownFolders() {
    tmpSubdirExecutables.removeCallback();
    tmpSubdirManOutput.removeCallback();
    tmpSubdirManRoot.removeCallback();
    tmpSubdirManifests.removeCallback();
    tmpDir.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js folders`);
}

function setupFiles() {
    tmpFileValidExecExt = tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpSubdirExecutables.name,
        prefix: 'valid-exec',
        postfix: '.exe'
    });
    tmpFileInvalidExecExt = tmp.fileSync({
        keep: true,
        tmpdir: dirTestTmp,
        dir: tmpSubdirExecutables.name,
        prefix: 'invalid-exec',
        postfix: '.txt'
    });

    logDebug(`Test resource setup finished: Manifest.test.js executable files`);
        
    {
        tmpManifestFileGenValid = makeTmpManifestYml('generic-valid');
        
        const rootDir = tmpSubdirManRoot.name;
        const outputPath = path.join(tmpSubdirManOutput.name, yamlToJsonExt(tmpManifestFileGenValid.name));
        const object = {
            name: "Some Valid Manifest",
            root: rootDir,
            output: outputPath,
            entries: [{name: "A Fake Game", exec: tmpFileValidExecExt.name}]
        };
        fs.writeFileSync(tmpManifestFileGenValid.name, yaml.stringify(object));

        manifestGenValid = new Manifest(tmpManifestFileGenValid.name, object);
    }

    {
        tmpManifestFileGenInvalid = makeTmpManifestYml('generic-invalid');
        const content = {
            name: "Some Invalid Manifest",
            // root: `${tmpDirManRootDir.name}`,
            // output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileGenInvalid.name))}`,
            entries: false
        };
        fs.writeFileSync(tmpManifestFileGenInvalid.name, yaml.stringify(content));
        // manGenInvalid = new Manifest(tmpFileGenInvalid.name, content);
    }

    {
        tmpManifestFileNonExistent = makeTmpManifestYml('non-existent');
        const content = {
            name: "Some Non-Existent Manifest",
            root: `${tmpSubdirManRoot.name}`,
            output: `${path.join(tmpSubdirManOutput.name, yamlToJsonExt(tmpManifestFileNonExistent.name))}`,
            entries: [{name: "A Fake Game", exec: tmpFileValidExecExt.name}]
        }
        fs.writeFileSync(tmpManifestFileNonExistent.name, yaml.stringify(content));
        manifestNonExistent = new Manifest(tmpManifestFileNonExistent.name, content);
        tmpManifestFileNonExistent.removeCallback();
    }

    {
        tmpManifestFileEmpty = makeTmpManifestYml('empty');
        fs.writeFileSync(tmpManifestFileEmpty.name, '');
        // manEmpty = new Manifest(tmpFileEmpty.name, {});
    }

    {
        tmpManifestFileNoNameAttr = makeTmpManifestYml('no-name-attribute');
        const output = path.join(tmpSubdirManOutput.name, yamlToJsonExt(tmpManifestFileNoNameAttr.name))
        const content = {
            root: `${tmpSubdirManRoot.name}`,
            output: `${path.join(tmpSubdirManOutput.name, yamlToJsonExt(tmpManifestFileNoNameAttr.name))}`,
            entries: [{name: "A Fake Game", exec: tmpFileValidExecExt.name}]
        };
        fs.writeFileSync(tmpManifestFileNoNameAttr.name, yaml.stringify(content));
        manifestNoNameAttr = new Manifest(tmpManifestFileNoNameAttr.name, content);
    }

    logDebug(`Test resource setup finished: Manifest.test.js .manifest.yml files`);
}

function teardownFiles() {
    tmpFileValidExecExt.removeCallback();
    tmpFileInvalidExecExt.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js executable files`);

    tmpManifestFileGenValid.removeCallback();
    tmpManifestFileGenInvalid.removeCallback();
    tmpManifestFileEmpty.removeCallback();
    tmpManifestFileNoNameAttr.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js Manifest YAML files`);
}

function setup() {
    setupFolders();
    setupFiles();
    console.log(`Test setup completed: Manifest.test.js`);
}

function teardown() {
    teardownFiles();
    teardownFolders();
    console.log(`Test teardown completed: Manifest.test.js`);
}

before(() => {
    setup();
});

after(() => {
    teardown();
});

describe('Class: Manifest', () => {

    // Constructor
    describe('Constructor', () => {

        it('should, when constructed based on a non-existent file, throw an error', () => {
            assert.throws(() => new Manifest(tmp.tmpNameSync(), {}));
        });

        // TODO More TEST for constructor

    });

    // MARK: Manifest#getNameOfFile
    describe('Method: getFileBasename()', () => {

        it("should, when instance constructed from existing manifest file, return a string not equal to the file's original path", () => {
            const nameOfFile = manifestGenValid.getFileBasename();
            assert.notStrictEqual(nameOfFile, manifestGenValid.filePath);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from valid manifest file, return true', () => {
            const hasAttr = manifestGenValid.hasNameAttribute();
            assert.strictEqual(hasAttr, true);
        });

        it('should, when instance constructed from manifest that has no name attribute, return false', () => {
            const hasAttr = manifestNoNameAttr.hasNameAttribute();
            assert.strictEqual(hasAttr, false);
        });

    });

    // Method: Manifest#getNameAttribute
    describe('Method: getNameAttribute()', () => {

    });

    // Method: Manifest#getName
    describe('Method: getName()', () => {

        it(`should, when instance constructed from valid manifest file, return string literal "Some Valid Manifest"`, () => {
            const name = manifestGenValid.getName();
            assert.strictEqual(name, 'Some Valid Manifest');
        });

        it("should, when instance constructed from manifest that has no name attribute, return file's basename as a string", () => {
            const name = manifestNoNameAttr.getName();
            const expected = path.basename(manifestNoNameAttr.filePath);
            assert.strictEqual(name, expected);
        });

        // TODO: Write more coverage
    });

});