import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import tmp from 'tmp';
import yaml from 'yaml';

import { logDebug } from '../../dist/utility/logging.js';
import { basenameWithoutExtensions } from '../../dist/utility/file.js';
import { Shortcut } from '../../dist/type/Shortcut.js';
import { Manifest } from '../../dist/type/Manifest.js';

import assert from 'node:assert';
import { before, after, describe, it } from 'node:test';
import { setOfFalsy } from '../resource/test-values.js';
import { tmpDirForScope, tmpManifestYml, tmpSubdir } from '../resource/test-utilities.js';

const __filebasename = path.basename(import.meta.filename);

let resourceDir, resourceSubdirManifests, resourceSubdirManRoot, resourceSubdirManOutput;

let resourceFileManOk;

let resourceManifestOk;

function setupFolders() {
    logDebug(`Test Resources: ${__filebasename} setupFolders begin`);
    resourceDir = tmpDirForScope(__filebasename);
    resourceSubdirManifests = tmpSubdir(resourceDir.name, 'manifests');
    resourceSubdirManOutput = tmpSubdir(resourceDir.name, 'output');
    resourceSubdirManRoot = tmpSubdir(resourceDir.name, 'root');
    logDebug(`Test Resources: ${__filebasename} setupFolders done`);
}

function teardownFolders() {
    logDebug(`Test Resources: ${__filebasename} teardownFolders begin`);
    resourceSubdirManRoot.removeCallback();
    resourceSubdirManOutput.removeCallback();
    resourceSubdirManifests.removeCallback();
    resourceDir.removeCallback();
    logDebug(`Test Resources: ${__filebasename} teardownFolders done`);
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

    logDebug(`Test Resources: ${__filebasename} setupFiles done`);
}

function teardownFiles() {
    logDebug(`Test Resources: ${__filebasename} teardownFiles begin`);
    resourceFileManOk.removeCallback();
    logDebug(`Test Resources: ${__filebasename} teardownFiles done`);
}

before(() => {
    logDebug(`Test Resources: ${__filebasename} Setup started`);
    setupFolders();
    setupFiles();
    console.log(chalk.green('Test Resources: Setup completed'));
});

after(() => {
    logDebug(`Test Resources: ${__filebasename} Teardown started`);
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