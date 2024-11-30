import path from "node:path";
import assert from "node:assert";
import { before, after, describe, it } from 'node:test';

import chalk from "chalk";
import tmp from 'tmp';

import { setOfFalsy } from "./util/test-values.js";

import { logDebugPlain } from "../src/util/utilities.js";
import Shortcut from "../src/Shortcut.js";
import Manifest from "../src/Manifest.js";

const __dirname = import.meta.dirname;
const __filename = path.basename(import.meta.filename);
const __dirtmp = path.join(__dirname, 'tmp');
// const dirScopeTmpPrefix = 'Shortcut.test.js';
// const dirScopeTmpPrefix = path.basename(__filename);

let tmpDir,
    tmpSubdirManifests,
    tmpSubdirManRoot,
    tmpSubdirManOutput;

let tmpManifestFileGenValid;

let manifestGenValid;

const makeTmpSubdir = (prefix) => {
    return tmp.dirSync({
        keep: true,
        tmpdir: __dirtmp,
        dir: tmpDir.name,
        prefix: prefix
    });
}

const makeTmpManifestYml = (prefix = 'manifest') => {
    return tmp.fileSync({
        keep: true,
        tmpdir: __dirtmp,
        dir: tmpSubdirManifests.name,
        prefix: prefix,
        postfix: '.manifest.yml'
    })
}

function setupFolders() {
    tmpDir = tmp.dirSync({
        keep: true,
        tmpdir: __dirtmp,
        prefix: __filename
    });
    tmpSubdirManifests = makeTmpSubdir('manifests');
    tmpSubdirManOutput = makeTmpSubdir('output');
    tmpSubdirManRoot = makeTmpSubdir('root');
    logDebugPlain(`Test Resources: ${__filename} setupFolders done`);
}

function teardownFolders() {
    tmpSubdirManRoot.removeCallback();
    tmpSubdirManOutput.removeCallback();
    tmpSubdirManifests.removeCallback();
    tmpDir.removeCallback();
    logDebugPlain(`Test Resources: ${__filename} teardownFolders done`);
}

function setupFiles() {
    tmpManifestFileGenValid = makeTmpManifestYml('gen-valid');

    logDebugPlain(`Test Resources: ${__filename} setupFiles done`);
}

function teardownFiles() {
    tmpManifestFileGenValid.removeCallback();
    logDebugPlain(`Test Resources: ${__filename} teardownFiles done`);
}

function setup() {
    setupFolders();
    setupFiles();
    console.log(chalk.green('Test Resources: Setup completed'));
}

function teardown() {
    // teardownFiles();
    // teardownFolders();
    console.log(chalk.green('Test Resources: Teardown completed'));
}

before(() => {
    setup();
});

after(() => {
    teardown();
});

describe('Class: Shortcut', () => {

    const shortcutObjectOk = {
        name: 'A Shortcut',
        exec: tmp.tmpNameSync({prefix: 'valid-executable', postfix: '.exe'})
    };

    describe('Constructor', () => {
        it('should, if constructed with a type other than Manifest given for arg manifest, throw an error', async (t) => {
            const values = [];
            for (const value of values) {
                await t.test(`Subtest for arg manifest=${value}`, () => {
                    assert.throws(() => new Shortcut(value, shortcutObjectOk));
                })
            }
        })
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
                assert.throws(() => new Shortcut(manifestGenValid, value));
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