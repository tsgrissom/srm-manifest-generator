import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks if a given file path has a file extension. When `fileExt` is set to *,
 * including by default, the function will return true if there is any extension
 * present in the given file path.
 * 
 * Optionally, set `fileExt` to a single file extension to only return true if
 * that single extension is present. Further, you can specify an array of
 * file extensions so the function returns true if any of the given extensions are
 * found.
 * 
 * @param {string} filePath The filepath to check for the given extensions.
 * @param {*} fileExt String or array of strings indicating which extensions to search for. Set to
 * "*" or keep at default value to return true for the presence of any extension.
 * @returns {boolean} Whether the given file extensions were found for the given filepath.
 * 
 * @example
 * // Checking for JSON extensions
 * const jsonExts = ['.json', '.jsonc'];
 * ['A file.json', 'Something in jsonc.jsonc']
 *      .forEach(each => {
 *          console.log(doesPathHaveFileExtension(each, jsonExts)); // true 2x
 *      }
 * );
 */
// TODO TEST Unit
export function pathHasFileExtension(filePath, fileExt = '*') {
    // TODO Write code
}

/**
 * Within the given `fileName`, replaces the `findExt` with `replaceExt` if they are found.
 * @param {string} fileName The filename you want to find and replace the extension of.
 * @param {Array} findExt The extensions you want to replace if found.
 * @param {string} replaceExt The new extension to append to `fileName`.
 * @param {boolean} normalize Default: `true`. Should extensions be checked to ensure they have a period at
 * the beginning, with one added if they do not?
 * @returns The `fileName`, with a new file extension `replaceExt` if one in `findExt` was found.
 */
export function replaceFileExtension(fileName, findExt, replaceExt, normalize = true) {
    if (!fileName || typeof fileName !== 'string')
        throw new Error(`Arg fileName must be a string: ${fileName}`);
    if (!findExt || (typeof findExt !== 'string' && !Array.isArray(findExt))) // TEST And make sure this doesn't have unexpected behavior
        throw new Error(`Arg findExt must be an array of strings or strings: ${fileName}`);
    if (typeof findExt === 'string' && findExt.trim() === '')
        throw new Error(`Arg findExt cannot be an empty string`);
    if (typeof replaceExt !== 'string')
        throw new Error(`Arg replaceExt must be a string: ${replaceExt}`);
    if (typeof normalize !== 'boolean')
        throw new Error(`Arg normalize must be a boolean: ${normalize}`);

    const extsToRemove = [];

    if (typeof findExt === 'string') {
        findExt = normalize ? normalizeFileExtension(findExt) : findExt;
        extsToRemove.push(findExt);
    } else if (Array.isArray(findExt)) {
        const normalized = findExt
            .filter(entry => {
                if (typeof entry !== 'string') {
                    console.error(`Arg findExt contained a non-string within its array value: ${entry}`);
                    return false;
                }
                
                return true;
            })
            .map(entry => normalize ? normalizeFileExtension(entry) : entry);
        extsToRemove.push(...normalized);
    }

    for (const remExt of extsToRemove) {
        const extname = path.extname(fileName);
        if (!extname || extname === '')
            return fileName;
        
        if (extname === remExt) {
            return path.basename(fileName, remExt);
        }
    }

    return fileName;
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
 * @param {*} extensionsToRemove The selected extensions to remove from the filename. Can be "*" to remove any extension.
 * @param {boolean} iterate Should the basename be iteraviley modified until all of the listed extensions are gone?
 * @returns {string} The final filename after being stripped of some selected extensions, if they were present.
 * @example // TODO Write example
 */
export function basenameWithoutExtensions(fileName, extensionsToRemove, iterate = false) {
    // TODO Lint args

    if (typeof fileName !== 'string')
        throw new Error(`Cannot determine file basename of non-string: ${fileName}`);
    if (typeof iterate !== 'boolean')
        throw new Error(`Cannot use non-boolean value for parameter "iterate": ${iterate}`);

    if (!Array.isArray(extensionsToRemove)) // TEST Unit
        extensionsToRemove = [extensionsToRemove];

    // for (let i = 0; i < extensionsToRemove.length; i++) { // TEST Unit
    //     const ext = extensionsToRemove[i];
    //     if (typeof ext !== 'string')
    //         continue;
    //     extensionsToRemove[i] = normalizeFileExtension(ext);
    // }

    for (const [index, entry] of extensionsToRemove.entries()) {
        if (typeof entry !== 'string')
            continue;
        extensionsToRemove[index] = normalizeFileExtension(entry);
    }

    let newName = path.basename(fileName);
    let extFound;
    
    if (!iterate) {
        for (const extToRemove of extensionsToRemove) {
            extFound = path.extname(newName);

            if (!extFound || extFound === '')
                return newName;

            if (extToRemove === '*' || extToRemove === extFound.toLowerCase()) {
                return path.basename(newName, extFound);
            }
        }
    }

    let removedExt = false;

    do {
        removedExt = false;
        extFound = path.extname(newName);

        if (!extFound || extFound === '')
            return newName;

        for (const extToRemove of extensionsToRemove) {
            if (extToRemove === '*' || extToRemove === extFound.toLowerCase()) {
                newName = path.basename(newName, extFound);
                removedExt = true;
                break;
            }
        }
    } while (removedExt);

    return newName;
}