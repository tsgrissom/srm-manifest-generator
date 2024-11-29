import path from 'node:path';

/**
 * Normalizes a file extension name, adding a period to the beginning if it is missing.
 * @param {string} fileExtension The file extension to normalize.
 * @returns The file extension in normalized form, with any missing period prefix that was not found in the input.
 */
export function normalizeFileExtension(fileExtension) {
    if (typeof fileExtension !== 'string')
        throw new Error(`Cannot normalize extension of non-string parameter "ext": ${fileExtension}`);

    if (!fileExtension.startsWith('.'))
        return `.${fileExtension}`;

    return fileExtension;
}

/**
 * Checks a file name's basename for the selected extensions and removes them if found.
 * If `iterative` is turned on, this process will be repeated until none of the extensions are present.
 * @param {string} fileName The filename to remove the extensions from. 
 * @param {*} extensionsToRemove The selected extensions to remove from the filename. Can be "*" to remove any extension.
 * @param {boolean} iterate Should the basename be iteraviley modified until all of the listed extensions are gone?
 * @returns {string} The final filename after being stripped of some selected extensions, if they were present.
 * @example // TODO Write example
 */
export function getFileBasenameWithoutExtensions(fileName, extensionsToRemove, iterate = false) {
    // TODO Support wildcard extensionsToRemove arg
    // TODO Lint args

    if (typeof fileName !== 'string')
        throw new Error(`Cannot determine file basename of non-string: ${fileName}`);
    if (typeof iterate !== 'boolean')
        throw new Error(`Cannot use non-boolean value for parameter "iterate": ${iterate}`);

    if (!Array.isArray(extensionsToRemove)) // TEST Unit
        extensionsToRemove = [extensionsToRemove];

    for (let i = 0; i < extensionsToRemove.length; i++) { // TEST Unit
        const ext = extensionsToRemove[i];
        extensionsToRemove[i] = normalizeFileExtension(ext);
    }

    let newName = path.basename(fileName);
    let extFound;

    if (iterate) { // TEST Unit
        do {
            extFound = path.extname(newName);

            if (!extFound || extFound === '')
                return newName;
    
            for (const extRemove of extensionsToRemove) {
                if (extRemove === '*' || extRemove === extFound.toLowerCase()) {
                    newName = path.basename(newName, extRemove);
                }
            }
        } while (extFound !== null);
    } else { // TEST Unit
        for (const extRemove of extensionsToRemove) {
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