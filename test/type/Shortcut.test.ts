import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import tmp, { DirResult, FileResult } from 'tmp';
import yaml from 'yaml';

import { dlog } from '../../src/utility/debug.js';
import { basenameWithoutExtensions } from '../../src/utility/path.js';
import Shortcut from '../../src/type/Shortcut.js';
import Manifest from '../../src/type/Manifest.js';
import ManifestData from '../../src/type/ManifestData.js';

import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';
import { setOfFalsy } from '../resource/test-values.js';
import { tmpDirForScope, tmpManifestYml, tmpSubdir } from '../resource/test-utilities.js';

const __filebasename = path.basename(import.meta.filename);

let resourceDir: DirResult,
    resourceSubdirManifests: DirResult,
    resourceSubdirManRoot: DirResult,
    resourceSubdirManOutput: DirResult;

let resourceFileManOk: FileResult;

let resourceManifestOk: Manifest;

function setupFolders() {
    dlog(`Test Resources: ${__filebasename} setupFolders begin`);
    resourceDir = tmpDirForScope(__filebasename);
    resourceSubdirManifests = tmpSubdir(resourceDir.name, 'manifests');
    resourceSubdirManOutput = tmpSubdir(resourceDir.name, 'output');
    resourceSubdirManRoot = tmpSubdir(resourceDir.name, 'root');
    dlog(`Test Resources: ${__filebasename} setupFolders done`);
}

function teardownFolders() {
    dlog(`Test Resources: ${__filebasename} teardownFolders begin`);
    resourceSubdirManRoot.removeCallback();
    resourceSubdirManOutput.removeCallback();
    resourceSubdirManifests.removeCallback();
    resourceDir.removeCallback();
    dlog(`Test Resources: ${__filebasename} teardownFolders done`);
}

function setupFiles() {
    dlog(`Test Resources: ${__filebasename} setupFiles begin`);

    resourceFileManOk = tmpManifestYml('gen-valid', resourceSubdirManifests.name);

    const name = basenameWithoutExtensions(resourceFileManOk.name, '*', true),
          rootDir = resourceSubdirManRoot.name,
          outputPath = resourceSubdirManOutput.name,
          manData: ManifestData = {name: name, rootDirectory: rootDir, outputPath: outputPath, shortcuts: []};
    
    fs.writeFileSync(resourceFileManOk.name, yaml.stringify(manData));
    resourceManifestOk = new Manifest(resourceFileManOk.name, manData);

    dlog(`Test Resources: ${__filebasename} setupFiles done`);
}

function teardownFiles() {
    dlog(`Test Resources: ${__filebasename} teardownFiles begin`);
    resourceFileManOk.removeCallback();
    dlog(`Test Resources: ${__filebasename} teardownFiles done`);
}

before(() => {
    dlog(`Test Resources: ${__filebasename} Setup started`);
    setupFolders();
    setupFiles();
    clog(chalk.green('Test Resources: Setup completed'));
});

after(() => {
    dlog(`Test Resources: ${__filebasename} Teardown started`);
    teardownFiles();
    teardownFolders();
    clog(chalk.green('Test Resources: Teardown completed'));
});

describe('Class: Shortcut', () => {

    const shortcutObjectOk = {
        name: 'A Shortcut',
        exec: tmp.tmpNameSync({prefix: 'valid-executable', postfix: '.exe'})
    };

    describe('Constructor', () => {
        it.skip('should, if constructed with a type other than Manifest given for arg manifest, throw an error', async (t) => {
            const values = ['string', 0, 3.14];
            for (const value of values) {
                await t.test(`Subtest for arg manifest=${value}`, () => {
                    // assert.throws(() => new Shortcut(value, shortcutObjectOk));
                });
            }
        });
    });

    it.skip('should, if constructed with a non-truthy manifest arg, throw an error', async (t) => {
        for (const value of setOfFalsy) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                // assert.throws(() => new Shortcut(value, shortcutObjectOk));
            });
        }
    });

    it.skip('should, if constructed with a non-truthy object arg, throw an error', async (t) => {
        for (const value of setOfFalsy) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                // assert.throws(() => new Shortcut(resourceManifestOk, value));
            });
        }
    });

    it.skip('should, if constructed with a non-Manifest manifest arg, throw an error', async (t) => {
        const values = [[], {}, 'string', 10, 10.5];
        for (const value of values) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                // assert.throws(() => new Shortcut(value, shortcutObjectOk));
            });
        }
    });

});

function clog(arg0: string) {
    throw new Error('Function not implemented.');
}
