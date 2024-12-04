import fs from 'node:fs/promises';
import path from 'node:path';

import clr from 'chalk';

import ConfigData from '../type/config/ConfigData';
import { SB_OK_SM, SB_ERR_SM } from './symbols';

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
 * @param filePath The filepath to check for the given extensions.
 * @param fileExt String or array of strings indicating which extensions to search for. Set to
 * "*" or keep at default value to return true for the presence of any extension.
 * @returns Whether the given file extensions were found for the given filepath.
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
export function pathHasFileExtension(filePath: string, fileExt: string | string[] = '*') {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);
    if (typeof fileExt !== 'string' && !Array.isArray(fileExt))
        throw new TypeError(`Arg fileExt must a string or an array: ${fileExt}`);
    if (typeof fileExt === 'string' && fileExt.trim() === '')
        throw new Error(`Arg fileExt cannot be an empty string: "${fileExt}"`);

    const extname = path.extname(filePath);

    if (typeof fileExt === 'string') {
        if (fileExt === '*' && (!extname || extname === '')) {
            return true;
        }
    } else {
        for (const findExt of fileExt) {
            if (extname === findExt.toLowerCase()) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Within the given `fileName`, replaces the `findExt` with `replaceExt` if they are found.
 * 
 * @param fileName The filename you want to find and replace the extension of.
 * @param findExt The extensions you want to replace if found.
 * @param replaceExt The new extension to append to `fileName`.
 * @param normalize Default: `true`. Should extensions be checked to ensure they have a period at
 * the beginning, with one added if they do not?
 * 
 * @returns The `fileName`, with a new file extension `replaceExt` if one in `findExt` was found.
 */
export function replaceFileExtension(
    fileName: string,
    findExt: string | string[],
    replaceExt: string,
    normalize: boolean = true
) : string {
    if (!fileName || typeof fileName !== 'string')
        throw new TypeError(`Arg fileName must be a string: ${fileName}`);
    if (!findExt || (typeof findExt !== 'string' && !Array.isArray(findExt))) // TEST And make sure this doesn't have unexpected behavior
        throw new TypeError(`Arg findExt must be a string or an array: ${fileName}`);
    if (typeof findExt === 'string' && findExt.trim() === '')
        throw new Error(`Arg findExt cannot be an empty string`);
    if (typeof replaceExt !== 'string')
        throw new TypeError(`Arg replaceExt must be a string: ${replaceExt}`);
    if (typeof normalize !== 'boolean')
        throw new TypeError(`Arg normalize must be a boolean: ${normalize}`);

    const extsToRemove = [];

    if (typeof findExt === 'string') {
        findExt = normalize ? normalizeFileExtension(findExt) : findExt;
        extsToRemove.push(findExt);
    } else {
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

/**
 * Normalizes a file extension name by prepending a period to it if needed.
 * 
 * @param extname The file extension to normalize.
 * @param excludeExts A string or string array which decides which extension names should be ignored.
 * * Default is `*` which does not mean "ignore all file extensions", but to avoid prepending the extname if
 *   it is string literal `*`.
 * 
 * @returns The file extension in normalized form, with a period prepended to the input if it was missing.
 */
export function normalizeFileExtension(
    extname: string,
    excludeExts: string | string[] = ['*']
) : string {
    if (typeof extname !== 'string')
        throw new TypeError(`Arg extname must be a string: ${extname}`);
    if (typeof excludeExts !== 'string' && !Array.isArray(excludeExts))
        throw new TypeError(`Arg excludeExtensions must be a string or a string array: ${excludeExts}`);
    
    if (typeof excludeExts === 'string') {
        if (excludeExts === '') {
            excludeExts = [''];
        } else {
            excludeExts = [excludeExts];
        }
    }

    if (extname.startsWith('.'))
        return extname;
    if (excludeExts.includes(extname.toLowerCase()))
        return extname;

    return `.${extname}`;
}

/**
 * Gets a file's basename with selected extensions removed.
 * If `iterate` is enabled, this process will be repeated until none of the extensions are present.
 * 
 * @param fileName The filename to remove the extensions from. 
 * @param extsToRemove The selected extensions to remove from the filename. Can be "*" to remove any extension.
 * @param iterate Should the basename be iteraviley modified until all of the listed extensions are gone?
 * 
 * @returns The final filename after being stripped of some selected extensions, if they were present.
 * 
 * @example // TODO Write example
 */
export function basenameWithoutExtensions(
    fileName: string,
    extsToRemove: string | string[],
    iterate: boolean = false
) : string {
    if (typeof fileName !== 'string')
        throw new TypeError(`Arg "fileName" must be a string: ${fileName}`);
    if (typeof extsToRemove !== 'string' && !Array.isArray(extsToRemove))
        throw new TypeError(`Arg "extensionsToRemove" must be a string or an array of strings: ${extsToRemove}`);
    if (typeof iterate !== 'boolean')
        throw new TypeError(`Arg "iterate" must be a boolean: ${iterate}`);

    if (!Array.isArray(extsToRemove)) // TEST Unit
        extsToRemove = [extsToRemove];

    for (const [index, entry] of extsToRemove.entries()) {
        if (typeof entry !== 'string')
            continue;
        extsToRemove[index] = normalizeFileExtension(entry);
    }

    let newName = path.basename(fileName);
    let extFound;
    
    if (!iterate) {
        for (const extToRemove of extsToRemove) {
            extFound = path.extname(newName);

            if (!extFound || extFound === '')
                return newName;
            // TODO Check each iteration and make sure there's still a string with content

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

        for (const extToRemove of extsToRemove) {
            if (extToRemove === '*' || extToRemove === extFound.toLowerCase()) {
                newName = path.basename(newName, extFound);
                removedExt = true;
                break;
            }
        }
    } while (removedExt);

    return newName;
}

/**
 * Formats a given filepath to a better version for console.
 * Options available are to apply underline and/or apply
 * quotations, both of which are enabled by default.
 * 
 * @param filePath The filepath to format.
 * @param useUnderline Whether to apply underline formatting
 *  to the given filepath.
 * @param useQuotes Whether to apply quotation marks to the
 *  the given filepath if it not surrounded by them already.
 * @returns The formatted filepath with the options applied.
 */
export function fmtPath( // FIXME Quote check doesn't seem to work
    filePath: string,
    useUnderline = true,
    useQuotes = true
) {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);

    // TODO Replace with quote utility function
    if (useQuotes && !filePath.startsWith('"'))
        filePath = '"' + filePath;
    if (useQuotes && !filePath.endsWith('"'))
        filePath = filePath + '"'
    if (useUnderline)
        filePath = clr.underline(filePath);

    return filePath;
}

/**
 * Styles the given path according to if it is accessible or not.
 * If the path is accessible, a green checkmark prefix is applied.
 * Otherwise, a red x-mark prefix is applied.
 * 
 * * This function uses `fs.access` to determine if the path is
 *   accessible or not
 * * This means that if the user does not have permissions to
 *   access the file, it will appear with the red x-mark, even
 *   if the path exists in the system
 * 
 * @param filePath The filepath to check for accessibility.
 * @returns A Promise which unwraps to a `boolean` value if
 *  resolved, which represents whether `filePath` was accessible
 *  or not.
 */
export async function fmtPathWithExistsPrefix( // TODO Update jsdoc
    filePath: string,
    config?: ConfigData,
    usePrefix = true,
    useSimplePrefix = true,
    useUnderline = true,
    useQuotes = true
) : Promise<string> {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);    

    if (useUnderline || useQuotes)
        filePath = fmtPath(filePath, useUnderline, useQuotes);
    if (!(config?.validate.filePaths ?? true))
        return filePath;

    let prefixOk  = '',
        prefixErr = '';
    if (usePrefix) {
        prefixOk =  useSimplePrefix ? SB_OK_SM  + ' ' : '(' + SB_OK_SM  + ') ';
        prefixErr = useSimplePrefix ? SB_ERR_SM + ' ' : '(' + SB_ERR_SM + ') ';
    }

    const accessible = await isPathAccessible(filePath);
    const prefix = usePrefix ? (accessible ? prefixOk : prefixErr) : ' ';

    return prefix + filePath;
}

export function fmtPathWithName(
    filePath: string,
    nickname: string,
    useUnderline = true,
    useQuotes = true
) : string {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);

    if (useUnderline || useQuotes)
        filePath = fmtPath(filePath, useUnderline, useQuotes);

    return nickname + ': ' + filePath;
}

export async function fmtPathWithExistsAndName(
    filePath: string,
    nickname: string,
    config?: ConfigData,
    linePrefix = '',
    useUnderline = true,
    useQuotes = true
) : Promise<string> {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);

    if (useUnderline || useQuotes)
        filePath = fmtPath(filePath, useUnderline, useQuotes);
    if (!(config?.validate.filePaths ?? true))
        return filePath;

    const accessible = await isPathAccessible(filePath);
    const prefix = accessible ? SB_OK_SM : SB_ERR_SM;

    return linePrefix + prefix + ' ' + nickname + ': ' + filePath;
}

export function fmtPathAsTag(
    filePath: string,
    useUnderline = true,
    useQuotes = true,
    innerPrefix = 'Path'
) : string {
    if (typeof filePath !== 'string')
        throw new TypeError(`Arg filePath must be a string: ${filePath}`);
    
    if (useUnderline || useQuotes)
        filePath = fmtPath(filePath, useUnderline, useQuotes);

    return '(' + innerPrefix + ': ' + filePath + ')';    
}

// TODO TEST Unit
export async function isPathAccessible(filePath: string) : Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}