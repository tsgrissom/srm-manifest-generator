import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import tmp from 'tmp';
import yaml from 'yaml';

import { logDebugPlain } from '../src/util/utilities.js';
import { basenameWithoutExtensions } from '../src/util/file-utilities.js';
import Shortcut from '../src/Shortcut.js';
import Manifest from '../src/Manifest.js';

import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';
import { setOfFalsy } from './util/sample-values.js';
import { tmpDirForScope, tmpManifestYml, tmpSubdir } from './util/resource-utilities.js';

const __filebasename = path.basename(import.meta.filename);

let resourceDir,
    resourceSubdirManifests,
    resourceSubdirManRoot,
    resourceSubdirManOutput;

let resourceFileManOk;

let resourceManifestOk;

function setupFolders() {
    logDebugPlain(`Test Resources: ${__filebasename} setupFolders begin`);
    resourceDir = tmpDirForScope(__filebasename);
    resourceSubdirManifests = tmpSubdir(resourceDir.name, 'manifests');
    resourceSubdirManOutput = tmpSubdir(resourceDir.name, 'output');
    resourceSubdirManRoot = tmpSubdir(resourceDir.name, 'root');
    logDebugPlain(`Test Resources: ${__filebasename} setupFolders done`);
}

function teardownFolders() {
    logDebugPlain(`Test Resources: ${__filebasename} teardownFolders begin`);
    resourceSubdirManRoot.removeCallback();
    resourceSubdirManOutput.removeCallback();
    resourceSubdirManifests.removeCallback();
    resourceDir.removeCallback();
    logDebugPlain(`Test Resources: ${__filebasename} teardownFolders done`);
}

function setupFiles() {
    logDebugPlain(`Test Resources: ${__filebasename} setupFiles begin`);

    resourceFileManOk = tmpManifestYml('gen-valid', resourceSubdirManifests.name);

    const name = basenameWithoutExtensions(resourceFileManOk.name, '*', true),
          root = resourceSubdirManRoot.name,
          output = resourceSubdirManOutput.name;
    const object = {name: name, root: root, output: output};
    
    fs.writeFileSync(resourceFileManOk.name, yaml.stringify(object));
    resourceManifestOk = new Manifest(resourceFileManOk.name, object);

    logDebugPlain(`Test Resources: ${__filebasename} setupFiles done`);
}

function teardownFiles() {
    logDebugPlain(`Test Resources: ${__filebasename} teardownFiles begin`);
    resourceFileManOk.removeCallback();
    logDebugPlain(`Test Resources: ${__filebasename} teardownFiles done`);
}

before(() => {
    logDebugPlain(`Test Resources: ${__filebasename} Setup started`);
    setupFolders();
    setupFiles();
    console.log(chalk.green('Test Resources: Setup completed'));
});

after(() => {
    logDebugPlain(`Test Resources: ${__filebasename} Teardown started`);
    teardownFiles();
    teardownFolders();
    console.log(chalk.green('Test Resources: Teardown completed'));
});

describe('Class: Shortcut', () => {

    const shortcutObjectOk = {
        name: 'A Shortcut',
        exec: tmp.tmpNameSync({prefix: 'valid-executable', postfix: '.exe'})
    };

    describe('Constructor', () => {
        it('should, if constructed with a type other than Manifest given for arg manifest, throw an error', async (t) => {
            const values = ['string', 0, 3.14];
            for (const value of values) {
                await t.test(`Subtest for arg manifest=${value}`, () => {
                    assert.throws(() => new Shortcut(value, shortcutObjectOk));
                });
            }
        });
    });

    it('should, if constructed with a non-truthy manifest arg, throw an error', async (t) => {
        for (const value of setOfFalsy) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                assert.throws(() => new Shortcut(value, shortcutObjectOk));
            });
        }
    });

    it('should, if constructed with a non-truthy object arg, throw an error', async (t) => {
        for (const value of setOfFalsy) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                assert.throws(() => new Shortcut(resourceManifestOk, value));
            });
        }
    });

    it('should, if constructed with a non-Manifest manifest arg, throw an error', async (t) => {
        const values = [[], {}, 'string', 10, 10.5];
        for (const value of values) {
            await t.test(`Subtest for arg manifest=${value}`, () => {
                assert.throws(() => new Shortcut(value, shortcutObjectOk));
            });
        }
    });

});