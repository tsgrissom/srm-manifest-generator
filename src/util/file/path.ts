import fs from 'node:fs/promises';
import path from 'node:path';

// MARK: pathHasFileExtension

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
// TODO Unit Test
export function pathHasFileExtension(
	filePath: string,
	fileExt: string | Array<string> = '*',
): boolean {
	if (typeof fileExt === 'string' && fileExt.trim() === '') {
		throw new Error(`Arg "fileExt" cannot be an empty string: "${fileExt}"`);
	}

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

// MARK: replaceFileExtension

/**
 * Within the given `fileName`, replaces the `findExt` with `replaceExt` if they are found.
 *
 * @param fileName The filename you want to find and replace the extension of.
 * @param findExt The extensions you want to replace if found.
 * @param replaceExt The new extension to append to `fileName`.
 *
 * @returns The `fileName`, with a new file extension `replaceExt` if one in `findExt` was found.
 */
// TEST Unit
export function replaceFileExtension(
	fileName: string,
	findExt: string | Array<string>,
	replaceExt: string,
): string {
	if (typeof findExt === 'string') {
		if (findExt.trim() === '') {
			throw new Error(`Arg "findExt" cannot be an empty string: "${findExt}"`);
		}

		findExt = [findExt];
	}

	// TODO Options: normalize, add if no extension found, repeat

	const normalized = findExt.map(ext => normalizeFileExtension(ext));
	replaceExt = normalizeFileExtension(replaceExt);

	for (const toRemove of normalized) {
		const extname = path.extname(fileName);

		if (!extname || extname === '') {
			return fileName;
		}

		if (extname === toRemove) {
			fileName = path.basename(fileName, toRemove);
		}
	}

	return fileName + replaceExt;
}

interface ReplaceExtensionOptions {
	extsToFind?: string | Array<string>;
	extsToIgnore?: string | Array<string>;
	replaceWith: string;
	normalizeInputs: boolean;
	iterations?: number;
}

// TODO removeFileExtension
export function removeFileExtension(
	str: string,
	options?: ReplaceExtensionOptions,
): string {}

// MARK: normalizeFileExtension

/**
 * Normalizes a file extension name by prepending a period to it if needed.
 *
 * @param extname The file extension to normalize.
 * @param excludeExts A string or string array which decides which extension names should be ignored.
 *
 * @returns The file extension in normalized form, with a period prepended to the input if it was missing.
 */
// TEST Unit
export function normalizeFileExtension(
	extname: string,
	excludeExts: string | Array<string> = [],
): string {
	// TODO Options: exclude, normalizeExcluded
	if (extname.trim() === '') {
		return '';
	}

	if (typeof excludeExts === 'string') {
		excludeExts = [excludeExts];
	}

	excludeExts = excludeExts.map(ext => normalizeFileExtension(ext));

	if (extname.startsWith('.') || excludeExts.includes(extname)) {
		return extname;
	}

	return '.' + extname;
}

// MARK: basenameWithoutExtensions

/**
 * Gets a file's basename with selected extensions removed.
 * If `iterate` is enabled, this process will be repeated until none of the extensions are present.
 *
 * @param fileName The filename to remove the extensions from.
 * @param toRemove The selected extensions to remove from the filename. Can be "*" to remove any extension.
 * @param iterate Should the basename be iteraviley modified until all of the listed extensions are gone?
 *
 * @returns The final filename after being stripped of some selected extensions, if they were present.
 *
 * @example // TODO Write example
 */
// TEST Unit
export function basenameWithoutExtensions(
	fileName: string,
	toRemove: string | Array<string> = '*',
	iterate = true,
): string {
	// TODO Options: current, ignoreCase, repeat count (0 for infinite)
	if (!Array.isArray(toRemove)) {
		toRemove = [toRemove];
	}

	toRemove = toRemove.map(rm => normalizeFileExtension(rm));

	fileName = path.basename(fileName);
	let extFound;

	if (!iterate) {
		for (const rm of toRemove) {
			extFound = path.extname(fileName);

			if (!extFound || extFound === '') {
				return fileName;
			}
			// TODO Check each iteration and make sure there's still a string with content

			if (rm === '*' || rm === extFound.toLowerCase()) {
				return path.basename(fileName, extFound);
			}
		}
	}

	let didRemove = false;

	do {
		didRemove = false;
		extFound = path.extname(fileName);

		if (!extFound || extFound === '') {
			return fileName;
		}

		for (const extToRemove of toRemove) {
			if (extToRemove === '*' || extToRemove === extFound.toLowerCase()) {
				fileName = path.basename(fileName, extFound);
				didRemove = true;
				break;
			}
		}
	} while (didRemove);

	return fileName;
}

/**
 * Checks if a given path is accessible according to Node's {@link fs.promises.access}.
 *
 * * A resolved value of `false` primarily indicates either the path does not exist, or
 *   the user lacks permission to access the file.
 * * Secondarily, other system errors could produce a `false` value, such as:
 *   Network issues if the file is on a network drive, file system errors or corruption,
 *   or insufficient system resources.
 *
 * @param filePath The filesystem path to check.
 * @returns A `Promise` which resolves to a `boolean` value which indicates whether
 *  the given {@link filePath} is accessible.
 */
export async function isPathAccessible(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}
