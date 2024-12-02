import path from 'node:path';
import fs from 'node:fs';

import tmp, { DirResult, FileResult } from 'tmp';
import yaml from 'yaml';

import { dlog } from '../../src/utility/logging.js';
import { replaceFileExtension } from '../../src/utility/path.js';
import { Manifest, ManifestData } from '../../src/type/Manifest.js';

import assert from 'node:assert';
import {
    before, after,
    describe, it 
} from 'node:test';
import { 
    shortcutObjFromFileName,
    tmpDirForScope,
    tmpManifestYml,
    tmpSubdir,
    tmpExecutableFile
} from '../resource/test-utilities.js';
import { Shortcut, ShortcutData } from '../../src/type/Shortcut.js';

const __filebasename = path.basename(import.meta.filename);

const yamlToJsonExt = (fileName: string) => {
    return replaceFileExtension(fileName, ['.yml', '.yaml'], '.json');
};

let resourceDir: DirResult,
    resourceSubdirManifests: DirResult,
    resourceSubdirManRoot: DirResult,
    resourceSubdirManOutput: DirResult,
    resourceSubdirExecutables: DirResult;

let resourceFileExecutableOk: FileResult,
    resourceFileExecutableBad: FileResult;

let resourceFileManOk: FileResult,
    resourceFileManBad: FileResult,
    resourceFileManNonExistent: FileResult,
    resourceFileManEmptyContents: FileResult,
    resourceFileManNoNameAttribute: FileResult;
    
let resourceManifestOk: Manifest,
    resourceManifestBad: Manifest,
    resourceManifestEmptyContents: Manifest,
    resourceManifestNonExistent: Manifest,
    resourceManifestNoNameAttribute: Manifest;

function setupDirs() {
    resourceDir = tmpDirForScope(__filebasename);
    const scopeDirName = resourceDir.name;

    resourceSubdirManifests   = tmpSubdir(scopeDirName, 'manifests');
    resourceSubdirManRoot     = tmpSubdir(scopeDirName, 'root');
    resourceSubdirManOutput   = tmpSubdir(scopeDirName, 'output');
    resourceSubdirExecutables = tmpSubdir(scopeDirName, 'executables');
    dlog(`Test resource setup finished: Manifest.test.js folders`);
}

function teardownDirs() {
    resourceSubdirExecutables.removeCallback();
    resourceSubdirManOutput.removeCallback();
    resourceSubdirManRoot.removeCallback();
    resourceSubdirManifests.removeCallback();
    resourceDir.removeCallback();
    dlog(`Test resource teardown finished: Manifest.test.js folders`);
}

function setupFiles() { // TODO Replace execs with a func from utils
    resourceFileExecutableOk = tmpExecutableFile(true, 'valid-executable');
    resourceFileExecutableBad = tmpExecutableFile(false, 'invalid-executable');

    dlog(`Test resource setup finished: Manifest.test.js executable files`);
        
    {
        resourceFileManOk = tmpManifestYml('generic-valid', resourceSubdirManifests.name);
        
        const root = resourceSubdirManRoot.name;
        const output = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManOk.name));
        const manData: ManifestData = {
            name: 'Some Valid Manifest',
            rootDirectory: root,
            outputPath: output,
            shortcuts: []
        };
        
        manData.shortcuts.push(
            new Shortcut(manData, {
                title: 'A Fake Game',
                target: resourceFileExecutableOk.name,
                enabled: true
            })
        );

        fs.writeFileSync(resourceFileManOk.name, yaml.stringify(manData));

        resourceManifestOk = new Manifest(resourceFileManOk.name, manData);
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
        const rootDir = resourceSubdirManRoot.name,
              outputPath = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManNonExistent.name)),
              manData: ManifestData = {name: 'Some Non-Existent Manifest', rootDirectory: rootDir, outputPath: outputPath, shortcuts: []};

        manData.shortcuts.push(new Shortcut(manData, shortcutObjFromFileName(resourceFileExecutableOk.name)))

        fs.writeFileSync(resourceFileManNonExistent.name, yaml.stringify(manData));
        
        resourceManifestNonExistent = new Manifest(resourceFileManNonExistent.name, manData);
        resourceFileManNonExistent.removeCallback();
    }

    {
        resourceFileManEmptyContents = tmpManifestYml('empty', resourceSubdirManifests.name);
        fs.writeFileSync(resourceFileManEmptyContents.name, '');
        // manEmpty = new Manifest(tmpFileEmpty.name, {});
    }

    {
        resourceFileManNoNameAttribute = tmpManifestYml('no-name-attribute', resourceSubdirManifests.name);
        const rootDir = resourceSubdirManRoot.name,
              outputPath = path.join(resourceSubdirManOutput.name, yamlToJsonExt(resourceFileManNoNameAttribute.name)),
              manData: ManifestData = {name: '', rootDirectory: rootDir, outputPath: outputPath, shortcuts: []};
        
        manData.shortcuts.push(new Shortcut(manData, shortcutObjFromFileName(resourceFileExecutableOk.name)));

        fs.writeFileSync(resourceFileManNoNameAttribute.name, yaml.stringify(manData));
        resourceManifestNoNameAttribute = new Manifest(resourceFileManNoNameAttribute.name, manData);
    }

    dlog(`Test resource setup finished: Manifest.test.js .manifest.yml files`);
}

function teardownFiles() {
    resourceFileExecutableOk.removeCallback();
    resourceFileExecutableBad.removeCallback();
    dlog(`Test resource teardown finished: Manifest.test.js executable files`);

    resourceFileManOk.removeCallback();
    resourceFileManBad.removeCallback();
    resourceFileManEmptyContents.removeCallback();
    resourceFileManNoNameAttribute.removeCallback();
    dlog(`Test resource teardown finished: Manifest.test.js Manifest YAML files`);
}

before(() => {
    setupDirs();
    setupFiles();
    console.log(`Test setup completed: Manifest.test.js`);
});

after(() => {
    teardownFiles();
    teardownDirs();
    console.log(`Test teardown completed: Manifest.test.js`);
});

describe('Class: Manifest', () => {

    // Constructor
    describe('Constructor', () => {

        it.skip('should, when constructed based on a non-existent file, throw an error', () => {
            // assert.throws(() => new Manifest(tmp.tmpNameSync(), {}));
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