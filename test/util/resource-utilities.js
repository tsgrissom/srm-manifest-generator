/* eslint-disable no-unused-vars */

import path from 'path';
import tmp from 'tmp';
const {DirResult, FileResult } = tmp;
import { basenameWithoutExtensions, normalizeFileExtension } from '../../src/util/file-utilities.js';

const __dirname = import.meta.dirname;

/**
 * The path to the project's test directory at `./test`
 */
export const __dirtest = path.join(__dirname, '..');

/**
 * The path to the project's test resource tmp files at `./test/resource`
 */
export const __dirtmp = path.join(__dirtest, 'resource');

/**
 * Creates a folder for current test within `test/resource` for storing
 * resource files belonging to the current test file. Use this dir
 * to store subdirectories and files pertinent to your test suite.
 * 
 * - IMPORTANT: This file is synchronous, so MUST be closed in your teardown by
 * invoking `DirResult#removeCallback`.
 * 
 * @param {string} __jsfilebasename The basename  of the current test
 * file. Can be found using `path.basename(import.meta.filename)`.
 * @returns {DirResult} The `DirResult` returned by the `tmp.dirSync` operation.
 * 
 * @example
 * // Obtain the __jsfilebasename at the top of your test file
 * import path from 'path';
 * __filebasename = path.basename(import.meta.filename);
 * 
 * let tmpDir, tmpSubdir;
 * 
 * const setupDirs = () => {
 *      tmpDir = tmpDirForScope(__filebasename);
 *      console.log(`tmpDir.name=${tmpDir.name}`);
 *      // > "YOUR/SYSTEM/PATH/TO/APP/test/resource/the-test-as-dir.test.js"
 *      // The above would be your tmp dir, where "the-test-as-dir.test.js" is a folder
 *      // Set up more subdirs here with `tmpSubdir`.
 *      // Teardown in reverse order! Start with all subdirs from the deepest level
 *      tmpSubdir = tmpSubdir(tmpDir.name);
 *
 * };
 * 
 * const teardownDirs = () => {
 *      // First, teardown any subdirectories made inside the tmpDir above
 *      // If you made files inside too, those should be removed before even subdirs
 *      tmpSubdir.removeCallback();
 *      tmpDir.removeCallback();
 * };
 * 
 * // setupFiles + teardownFiles
 * 
 * // Assuming using Node test runner
 * before(() => {
 *      setupDirs();
 *      // setupFiles();
 * });
 * after(() => {
 *      teardownDirs();
 *      // setupDirs();
 * });
 */
export function tmpDirForScope(__jsfilebasename) {
    return tmp.dirSync({
        tmpdir: __dirtmp,
        prefix: __jsfilebasename
    });
}

/**
 * Synchronously creates a subdirectory within a test-scoped tmp directory,
 * such as creating `manifests` within dir `test/resource/Manifest.test.js` for
 * a structure of `test/resource/Manifest.test.js/manifests`.
 * 
 * - You must create a tmp dir for the current test scope with the
 * function `tmpDirForScope`.
 * - IMPORTANT: This file is synchronous, so MUST be closed in your teardown by
 * invoking `DirResult#removeCallback`.
 * 
 * @param {string} parentDirname The dirname of the dir made by `tmpDirForScope`.
 * @param {string} prefix The prefix to apply to the subdirectory to aid
 * randomization.
 * 
 * @returns {DirResult} The `DirResult` returned by the `tmp.dirSync` operation.
 */
export function tmpSubdir(parentDirname, prefix = 'subdir') {
    return tmp.dirSync({tmpdir: __dirtmp, dir: parentDirname, prefix: prefix});
}

/**
 * Synchronously creates a tmp manifest YAML file in the given dir, which is
 * expected to be a subdirectory of `test/resource`. The file will have a postfix of
 * either `.yml` or `.yaml`.
 * 
 * - IMPORTANT: This file is synchronous, so MUST be closed in your teardown by
 * invoking `FileResult#removeCallback`.
 * 
 * @param {string} prefix The prefix to prepend to the filename for debugging.
 * Default: "manifest".
 * @param {string} dirname The directory to place the file in, especially a
 * subdirectory. Default: ".".
 * @param {boolean} randomness Whether to use randomness to sometimes use
 * the alternate YAML file extension ".yaml". 
 * If true, the created file will randomly end in either ".manifest.yml"
 * or ".manifest.yaml", whereas if false the file will only ever end in
 * ".manifest.yml".
 * 
 * @returns {FileResult} The `FileResult` returned by the `tmp.fileSync` operation.
 */
export function tmpManifestYml(prefix = 'manifest', dirname = '.', randomness = true) {
    const stdExt = '.manifest.yml';
    let postfix;

    if (randomness) {
        postfix = Math.random() < 0.5 ? stdExt : '.manifest.yaml';
    } else {
        postfix = stdExt;
    }

    return tmp.fileSync({tmpdir: __dirtmp, dir: dirname, prefix: prefix, postfix: postfix});
}

/**
 * Synchronously creates a tmp "executable" file in the given dir which will
 * have a postfix of `validPostfix` or `invalidPostfix` depending on the value
 * of `valid`.
 * 
 * - IMPORTANT: This file is synchronous, so MUST be closed in your teardown by
 * invoking `DirResult#removeCallback`.
 * 
 * @param {boolean} valid Whether the executable file is representing an actual
 * executable or a non-executable passed as an executable. Default: true.
 * @param {string} prefix The prefix to prepend to the filename for debugging.
 * Default: "exec".
 * @param {string} dirname The directory to place the file in, especially a
 * subdirectory. Default: ".".
 * @param {string} validPostfix The postfix to apply if `valid` is true. Should be
 * an extension which is representing a real executable, such as the default ".exe".
 * @param {string} invalidPostfix The postfix to apply if `valid` is false.
 * 
 * @returns {FileResult} The `FileResult` returned by the `tmp.fileSync` operation.
 */
export function tmpExecutableFile(valid = true, prefix = 'exec', dirname = '.', validPostfix = '.exe', invalidPostfix = '.txt') {
    if (typeof valid !== 'boolean')
        throw new Error(`Arg "valid" must be a boolean: ${valid}`);
    
    if (!dirname || typeof dirname !== 'string')
        dirname = '.';
    if (!validPostfix || typeof validPostfix !== 'string')
        validPostfix = '.exe';
    if (!invalidPostfix || typeof invalidPostfix !== 'string')
        invalidPostfix = '.txt';

    validPostfix = normalizeFileExtension(validPostfix);
    invalidPostfix = normalizeFileExtension(invalidPostfix);
    const postfix = valid ? validPostfix : invalidPostfix;

    return tmp.fileSync({
        tmpdir: __dirtmp,
        dir: dirname,
        prefix: prefix,
        postfix: postfix
    });
}

/**
 * Creates a barebones shortcut object from a given filename. Useful for mocking
 * up Manifests and their Shortcuts section.
 * 
 * * This function does not access the filesystem. Instead, it is used to quickly
 * create a simple object from a filename string.
 * * The created object can be successfully used to construct a Shortcut instance.
 * 
 * @param {string} fileName The filename to create the JSON from. The whole path will
 * be used for the target, while the basename without extensions will be used
 * for the title.
 * @param {boolean} randomness Whether to incorporate randomness, sometimes making
 * the shortcut object in its alternate forms using aliases of its keys.
 * 
 * * Default: `true`
 * * If `true`, instead of the standard, Steam ROM Manager-compatible `title` and
 * `target` keys, the SRM Manifest Generator keys `name` and `exec` might be used.
 * * If `false`, the only format which will be output from this function will be
 * the Steam ROM Manager-compatible `title` and `target` JSON format.
 * 
 * @returns {object} The JSON representation of the given filename.
 * 
 * @example
 * // Given an exe file in the working directory named "App.exe", though not checked by fn
 * const objWithoutRandomness = shortcutObjFromFileName('App.exe', false);
 * // Output will only be:
 * { title: "App", target: "App.exe" }
 * const objWithRandomness = shortcutObjFromFileName('App.exe', true);
 * // Output could be either:
 * { title: "App", target: "App.exe" } // The format Steam ROM Manager uses in manual manifests
 * // or
 * { name: "App", exec: "App.exe" } // The compact format we use for YAML structure
 */
export function shortcutObjFromFileName(fileName, randomness = true) {
    if (!fileName || typeof fileName !== 'string')
        throw new Error(`Arg "fileName" must be a string: ${fileName}`);
    if (typeof fileName === 'string' && fileName.trim() === '')
        throw new Error(`Arg "fileName" cannot be an empty string: "${fileName}"`);
    if (typeof randomness !== 'boolean')
        throw new Error(`Arg "randomness" must be a boolean: ${randomness}`);

    const title = basenameWithoutExtensions(fileName, '*');
    const target = fileName;

    const standardForm = {title:title,target:target};

    if (!randomness)
        return standardForm;

    const random = Math.random();

    if (random < 0.5)
        return {name: title, exec: target};

    return standardForm;
}