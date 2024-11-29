import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks if a given file path has a file extension. When `fileExt` is set to *,
 * including by default, the function will return true if there is any extension
 * present in the given file path.
 * Optionally, set `fileExt` to a single file extension to only return true if
 * that single extension is present. Further, you can specify an array of
 * file extensions so the function returns true if any of the given extensions are
 * found.
 * @param {string} filePath 
 * @param {*} fileExt
 * @returns
 * @example
 * // Checking for JSON extensions
 * const jsonExts = ['.json', '.jsonc'];
 * ['A file.json', 'Something in jsonc.jsonc']
 *      .forEach(each => {
 *          console.log(doesPathHaveFileExtension(each, jsonExts)); // true 2x
 *      }
 * );
 */
// TODO jsdoc example
// TODO TEST Unit
export function pathHasFileExtension(filePath, fileExt = '*') {
    // TODO Write code
}

export async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Normalizes a file extension name by prepending a period to it if needed.
 * @param {string} extname The file extension to normalize.
 * @param {*} exclude A str, array, or null. Lists which extension names should be ignored.
 *      Default is `*` which does not mean "ignore all file extensions", but to avoid prepending the extname if
 *      it is string literal `*`.
 * @returns The file extension in normalized form, with a period prepended to the input if it was missing.
 */
export function normalizeFileExtension(extname, exclude = ['*']) {
    if (typeof extname !== 'string')
        throw new Error(`Cannot normalize extension of non-string parameter fileExt: ${extname}`);
    
    if (!exclude)
        exclude = [''];
    if (!Array.isArray(exclude) && typeof exclude === 'string')
        exclude = [exclude];
    if (extname.startsWith('.'))
        return extname;
    if (exclude.includes(extname.toLowerCase()))
        return extname;

    return `.${extname}`;
}

/**
 * Gets a file's basename with selected extensions removed.
 * If `iterative` is turned on, this process will be repeated until none of the extensions are present.
 * @param {string} fileName The filename to remove the extensions from. 
 * @param {*} extsRemove The selected extensions to remove from the filename. Can be "*" to remove any extension.
 * @param {boolean} iterate Should the basename be iteraviley modified until all of the listed extensions are gone?
 * @returns {string} The final filename after being stripped of some selected extensions, if they were present.
 * @example // TODO Write example
 */
export function basenameWithoutExtensions(fileName, extsRemove, iterate = false) {
    // TODO Lint args

    if (typeof fileName !== 'string')
        throw new Error(`Cannot determine file basename of non-string: ${fileName}`);
    if (typeof iterate !== 'boolean')
        throw new Error(`Cannot use non-boolean value for parameter "iterate": ${iterate}`);

    if (!Array.isArray(extsRemove)) // TEST Unit
        extsRemove = [extsRemove];

    for (let i = 0; i < extsRemove.length; i++) { // TEST Unit
        const ext = extsRemove[i];
        extsRemove[i] = normalizeFileExtension(ext);
    }

    let newName = path.basename(fileName);
    let extFound;

    if (iterate) { // TEST Unit
        do {
            extFound = path.extname(newName);

            if (!extFound || extFound === '')
                return newName;
    
            for (const extRemove of extsRemove) {
                if (extRemove === '*' || extRemove === extFound.toLowerCase()) {
                    newName = path.basename(newName, extRemove);
                }
            }
        } while (extFound !== null);
    } else { // TEST Unit
        for (const extRemove of extsRemove) {
            extFound = path.extname(newName);

            if (!extFound || extFound === '')
                return newName;

            if (extRemove === '*' || extRemove === extFound.toLowerCase()) {
                return path.basename(newName, extRemove);
            }
        }
    }

    return newName;
}