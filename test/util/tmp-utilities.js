import path from 'path';
import tmp from 'tmp';
import { basenameWithoutExtensions } from '../../src/util/file-utilities';

const __dirname = import.meta.dirname;
const __dirtest = path.join(__dirname, '..');
const __dirtmp = path.join(__dirtest, 'tmp');

export function tmpDirForScope(__jsfilename) {
    return tmp.dirSync({
        keep: true,
        tmpdir: __dirtmp,
        prefix: __jsfilename
    });
}

/**
 * 
 * @param {*} __jsfilename 
 * @param {*} tmpDirName 
 * @param {*} prefix 
 * @returns 
 */
export function tmpSubdir(__jsfilename, tmpDirName, prefix = 'subdir') {
    return tmp.dirSync({
        keep: true,
        tmpdir: __dirtmp,
        dir: tmpDirName,
        prefix: prefix
    });
}

/**
 * Synchronously creates a tmp manifest YAML file in the given subdir, which is
 * expected to be a subdirectory of `test/tmp`. The file will have a prefix of
 * either `.yml` or `.yaml`.
 * This file is synchronous, so MUST be closed with `FileResult#removeCallback()`
 * on teardown.
 * @param {string} prefix Default: "manifest". Prepended to the filename for
 * debugging.
 * @param {string} subdirName Default: ".". The subdirectory to place the file in.
 * @returns {FileResult} The `tmp` FileResult returned by the `fileSync` operation.
 */
export function tmpManifestYml(prefix = 'manifest', subdirName = '.') {
    const postfix = Math.random() < 0.5 ? '.manifest.yml' : '.manifest.yaml';

    return tmp.fileSync({
        keep: true,
        tmpdir: __dirtmp,
        dir: subdirName,
        prefix: prefix,
        postfix: postfix
    });
}

/**
 * Creates a barebones shortcut object from a given filename. Useful for mocking
 * up Manifests and their Shortcuts section.
 * @param {string} fileName The filename to create the JSON from. The whole path will
 * be used for the target, while the basename without extensions will be used
 * for the title.
 * @returns {object} The JSON representation of the given filename.
 */
export function shortcutObjFromFileName(fileName) {
    const basename = basenameWithoutExtensions(fileName);

    const random = Math.random();
    if (random < 0.5) {
        return {
            title: basename,
            target: fileName
        };
    } else {
        return {
            name: basename,
            exec: fileName
        };
    }
}