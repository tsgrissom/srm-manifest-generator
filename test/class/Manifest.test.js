import path from 'node:path';
import fs from 'node:fs';

import tmp from 'tmp';
import yaml from 'yaml';

import { logDebug } from '../../src/utility/logging.js';
import { replaceFileExtension } from '../../src/utility/file.js';
import Manifest from '../../src/class/Manifest.js';

import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';
import { shortcutObjFromFileName, tmpDirForScope, tmpManifestYml, tmpSubdir, tmpExecutableFile } from '../resource/test-utilities.js';

const __filebasename = path.basename(import.meta.filename);

const yamlToJsonExt = (fileName) => {
    return replaceFileExtension(fileName, ['.yml', '.yaml'], '.json');
};

let resourceDir,
    resourceSubdirManifests,
    resourceSubdirManRoot,
    resourceSubdirManOutput,
    resourceSubdirExecutables;

let resourceFileManOk,
    resourceFileManBad,
    resourceFileManNonExistent,
    resourceFileManEmptyContents,
    resourceFileManNoNameAttribute;
    
let resourceManifestOk,
    resourceManifestBad,
    resourceManifestNonExistent,
    resourceManifestEmptyContents,
    resourceManifestNoNameAttribute;

let resourceFileExecutableOk,
    resourceFileExecutableBad;

function setupFolders() {
    resourceDir = tmpDirForScope(__filebasename);
    resourceSubdirManifests = tmpSubdir(resourceDir.name, 'manifests');
    resourceSubdirManRoot = tmpSubdir(resourceDir.name, 'root');
    resourceSubdirManOutput = tmpSubdir(resourceDir.name, 'output');
    resourceSubdirExecutables = tmpSubdir(resourceDir.name, 'executables');
    logDebug(`Test resource setup finished: Manifest.test.js folders`);
}

function teardownFolders() {
    resourceSubdirExecutables.removeCallback();
    resourceSubdirManOutput.removeCallback();
    resourceSubdirManRoot.removeCallback();
    resourceSubdirManifests.removeCallback();
    resourceDir.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js folders`);
}

function setupFiles() { // TODO Replace execs with a func from utils
    resourceFileExecutableOk = tmpExecutableFile(true, 'valid-executable');
    resourceFileExecutableBad = tmpExecutableFile(false, 'invalid-executable');

    logDebug(`Test resource setup finished: Manifest.test.js executable files`);
        
    {
        resourceFileManOk = tmpManifestYml('generic-valid', resourceSubdirManifests.name);
        
        const root = resourceSubdirManRoot.name;
        const output = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManOk.name));
        const object = {
            name: 'Some Valid Manifest',
            root: root,
            output: output,
            entries: [{name: 'A Fake Game', exec: resourceFileExecutableOk.name}]
        };
        fs.writeFileSync(resourceFileManOk.name, yaml.stringify(object));

        resourceManifestOk = new Manifest(resourceFileManOk.name, object);
    }

    {
        resourceFileManBad = tmpManifestYml('generic-invalid', resourceSubdirManifests.name);
        const object = {
            name: 'Some Invalid Manifest',
            // root: `${tmpDirManRootDir.name}`,
            // output: `${path.join(tmpDirManOutput.name, replaceYamlExtensionWithJson(tmpFileGenInvalid.name))}`,
            entries: false
        };
        fs.writeFileSync(resourceFileManBad.name, yaml.stringify(object));
        // manGenInvalid = new Manifest(tmpFileGenInvalid.name, content);
    }

    {
        resourceFileManNonExistent = tmpManifestYml('non-existent', resourceSubdirManifests.name);
        const root = resourceSubdirManRoot.name,
              output = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManNonExistent.name)),
              entries = shortcutObjFromFileName(resourceFileExecutableOk.name);
        const object = {name: 'Some Non-Existent Manifest', root: root, output: output, entries: entries};
        fs.writeFileSync(resourceFileManNonExistent.name, yaml.stringify(object));
        resourceManifestNonExistent = new Manifest(resourceFileManNonExistent.name, object);
        resourceFileManNonExistent.removeCallback();
    }

    {
        resourceFileManEmptyContents = tmpManifestYml('empty', resourceSubdirManifests.name);
        fs.writeFileSync(resourceFileManEmptyContents.name, '');
        // manEmpty = new Manifest(tmpFileEmpty.name, {});
    }

    {
        resourceFileManNoNameAttribute = tmpManifestYml('no-name-attribute', resourceSubdirManifests.name);
        const root = resourceSubdirManRoot.name,
              output = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManNoNameAttribute.name)),
              entries = shortcutObjFromFileName(resourceFileExecutableOk.name);
        const content = {root: root, output: output, entries: entries};
        fs.writeFileSync(resourceFileManNoNameAttribute.name, yaml.stringify(content));
        resourceManifestNoNameAttribute = new Manifest(resourceFileManNoNameAttribute.name, content);
    }

    logDebug(`Test resource setup finished: Manifest.test.js .manifest.yml files`);
}

function teardownFiles() {
    resourceFileExecutableOk.removeCallback();
    resourceFileExecutableBad.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js executable files`);

    resourceFileManOk.removeCallback();
    resourceFileManBad.removeCallback();
    resourceFileManEmptyContents.removeCallback();
    resourceFileManNoNameAttribute.removeCallback();
    logDebug(`Test resource teardown finished: Manifest.test.js Manifest YAML files`);
}

before(() => {
    setupFolders();
    setupFiles();
    console.log(`Test setup completed: Manifest.test.js`);
});

after(() => {
    teardownFiles();
    teardownFolders();
    console.log(`Test teardown completed: Manifest.test.js`);
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
            const nameOfFile = resourceManifestOk.getFileBasename();
            assert.notStrictEqual(nameOfFile, resourceManifestOk.filePath);
        });
    
    });

    describe('Method: hasNameAttribute()', () => {

        it('should, when instance constructed from valid manifest file, return true', () => {
            const hasAttr = resourceManifestOk.hasNameAttribute();
            assert.strictEqual(hasAttr, true);
        });

        it('should, when instance constructed from manifest that has no name attribute, return false', () => {
            const hasAttr = resourceManifestNoNameAttribute.hasNameAttribute();
            assert.strictEqual(hasAttr, false);
        });

    });

    // Method: Manifest#getNameAttribute
    describe('Method: getNameAttribute()', () => {

    });

    // Method: Manifest#getName
    describe('Method: getName()', () => {

        it(`should, when instance constructed from valid manifest file, return string literal "Some Valid Manifest"`, () => {
            const name = resourceManifestOk.getName();
            assert.strictEqual(name, 'Some Valid Manifest');
        });

        it("should, when instance constructed from manifest that has no name attribute, return file's basename as a string", () => {
            const name = resourceManifestNoNameAttribute.getName();
            const expected = path.basename(resourceManifestNoNameAttribute.filePath);
            assert.strictEqual(name, expected);
        });

        // TODO: Write more coverage
    });

});