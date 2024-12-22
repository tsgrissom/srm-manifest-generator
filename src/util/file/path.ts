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
// TODO Unit Test
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

	const normalized = findExt.map(ext => normalizeFileExtension(ext));

	for (const toRemove of normalized) {
		const extname = path.extname(fileName);

		if (!extname || extname === '') {
			return fileName;
		}

		if (extname === toRemove) {
			return path.basename(fileName, toRemove);
		}
	}

	return fileName;
}

// MARK: normalizeFileExtension

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
// TODO Unit Test
export function normalizeFileExtension(
	extname: string,
	excludeExts: string | Array<string> = ['*'],
): string {
	if (typeof excludeExts === 'string') {
		if (excludeExts === '') {
			excludeExts = [''];
		} else {
			excludeExts = [excludeExts];
		}
	}

	if (extname.startsWith('.')) return extname;
	if (excludeExts.includes(extname.toLowerCase())) return extname;

	return `.${extname}`;
}

// MARK: basenameWithoutExtensions

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
// TODO Unit Test
export function basenameWithoutExtensions(
	fileName: string,
	extsToRemove: string | Array<string> = '*',
	iterate = true,
): string {
	if (!Array.isArray(extsToRemove)) {
		// TEST Unit
		extsToRemove = [extsToRemove];
	}

	for (const [index, entry] of extsToRemove.entries()) {
		if (typeof entry !== 'string') {
			continue;
		}

		extsToRemove[index] = normalizeFileExtension(entry);
	}

	let newName = path.basename(fileName);
	let extFound;

	if (!iterate) {
		for (const extToRemove of extsToRemove) {
			extFound = path.extname(newName);

			if (!extFound || extFound === '') {
				return newName;
			}
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

		if (!extFound || extFound === '') {
			return newName;
		}

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
