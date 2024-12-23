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

// MARK: normalizeFileExtension

/**
 * Normalizes a file extension name by prepending a period to it if needed.
 *
 * @param extname The file extension to normalize.
 * @param extsToIgnore A string or string array which decides which extension names should be ignored.
 *
 * @returns The file extension in normalized form, with a period prepended to the input if it was missing.
 */
// TEST Unit
export function normalizeFileExtension(
	extname: string,
	extsToIgnore: string | Array<string> = [],
): string {
	// SECTION: Normalize args

	// Param: extname
	if (extname.trim() === '') {
		return '';
	}

	if (extname === '*') {
		return '*';
	}

	// Param: excludeExts
	if (typeof extsToIgnore === 'string') {
		if (extsToIgnore === '') {
			extsToIgnore = [];
		} else if (extsToIgnore === '*') {
			console.error(
				`Arg "extsToIgnore" of replaceFileExtension cannot be a wildcard. It will be ignored.`,
			);
			extsToIgnore = [];
		} else {
			extsToIgnore = extsToIgnore.startsWith('.')
				? [extsToIgnore]
				: ['.' + extsToIgnore];
		}
	} else {
		if (!Array.isArray(extsToIgnore)) {
			throw new Error(`Unexpected! Expected arg "extsToFind" to be an array`);
		}

		if (extsToIgnore.includes('*')) {
			console.error(
				`Arg "extsToIgnore" of replaceFileExtension cannot be a wildcard. It will be ignored.`,
			);
			extsToIgnore = [];
		} else {
			extsToIgnore = extsToIgnore
				.map(toIgnore => normalizeFileExtension(toIgnore))
				.filter(toIgnore => toIgnore !== '');
		}
	}

	if (extname.startsWith('.') || extsToIgnore.includes(extname)) {
		return extname;
	} else {
		return '.' + extname;
	}
}

export interface ReplaceExtensionOptions {
	extsToFind?: string | Array<string>;
	extsToIgnore?: string | Array<string>;
	replaceWith: string;
	repetitions?: number;
}

// MARK: replaceFileExtension
export function replaceFileExtension(
	fileName: string,
	options: ReplaceExtensionOptions,
): string {
	const { repetitions } = options;
	let { extsToFind, extsToIgnore, replaceWith } = options;

	// SECTION: Normalize arguments

	// Param: fileName

	if (fileName === '') {
		return '';
	}

	fileName = normalizeFileExtension(fileName);

	// Param: extsToIgnore

	if (typeof extsToIgnore === 'undefined') {
		// none provided means none should be ignored
		extsToIgnore = [];
	} else if (typeof extsToFind === 'string') {
		// sanitize the string + normalize to equivalent array
		if (extsToIgnore === '*') {
			console.error(
				`Arg "extsToIgnore" of replaceFileExtension cannot be a wildcard. It will be ignored.`,
			);
			extsToIgnore = [];
		} else if (extsToIgnore === '') {
			extsToIgnore = [];
		} else {
			extsToIgnore = [normalizeFileExtension(extsToIgnore as string)];
		}
	} else {
		// is an array, but to be type-safe
		if (!Array.isArray(extsToIgnore)) {
			throw new Error(`Unexpected! Expected arg "extsToIgnore" to be an array`);
		} else {
			if (extsToIgnore.includes('')) {
				extsToIgnore = [];
			} else if (extsToIgnore.includes('*')) {
				console.error(
					`Arg "extsToIgnore" of replaceFileExtension cannot be a wildcard. It will be ignored.`,
				);
				extsToIgnore = [];
			} else {
				extsToIgnore = extsToIgnore.map(element =>
					normalizeFileExtension(element),
				);
			}
		}
	}

	// Param: extsToFind
	// If extsToFind is any of the following, it becomes a wildcard str literal "*":
	// - An empty array or an array containing an empty string literal ""
	// - The string literal ""
	// - Undefined

	if (typeof extsToFind === 'undefined') {
		extsToFind = '*';
	} else if (typeof extsToFind === 'string') {
		if (extsToFind === '' || extsToFind === '*') {
			extsToFind = '*';
		} else {
			extsToFind = [normalizeFileExtension(extsToFind)];
		}
	} else {
		// is an array
		if (!Array.isArray(extsToFind)) {
			throw new Error(`Unexpected! Expected arg "extsToFind" to be an array`);
		}

		if (extsToFind.length === 0) {
			extsToFind = '*';
		} else {
			// at least one value in the array
			if (extsToFind.includes('') || extsToFind.includes('*')) {
				extsToFind = '*';
			} else {
				// does not contain empty str or wildcard
				// filter out contradictions + map normalized values

				extsToFind = extsToFind
					.map(toFind => normalizeFileExtension(toFind))
					.filter(toFind => {
						const isContradictory =
							(toFind !== '*' && extsToIgnore.includes(toFind)) ||
							extsToIgnore.includes(toFind);
						if (isContradictory) {
							console.warn(
								`Args "extsToIgnore" and "extsToFind" both contain value "${toFind}". The value will be ignored and unexpected behavior may occur.`,
							);
							return false;
						}
						return true;
					});
			}
		}
	}

	// Param: iterations

	enum ShouldRepeat {
		Never,
		NumberOfTimes,
		Infinitely,
	}

	let shouldRepeat: ShouldRepeat = ShouldRepeat.Never;
	let nRepetitions = 0;

	// if undefined, 0, or 1, do once and done
	// if < 0, do as many times until no extensions found
	// if > 0, do x amount of times and done

	if (typeof repetitions === 'undefined') {
		shouldRepeat = ShouldRepeat.Never;
		nRepetitions = 0;
	} else if (typeof repetitions === 'number') {
		if (repetitions < 0) {
			shouldRepeat = ShouldRepeat.Infinitely;
			nRepetitions = -1;
		} else if (repetitions === 0) {
			shouldRepeat = ShouldRepeat.Never;
			nRepetitions = 0;
		} else {
			shouldRepeat = ShouldRepeat.NumberOfTimes;
			nRepetitions = repetitions;
		}
	}

	// Param: replaceWith
	replaceWith = normalizeFileExtension(replaceWith);

	// SECTION: Start replacement

	let didRemove = false;
	let lastFound = '';
	let doneRepetitions = -1;

	const isToFindWildcard = typeof extsToFind === 'string' && extsToFind === '*';
	const isIgnored = (str: string): boolean => extsToIgnore.includes(str);
	const isToFind = (str: string): boolean => extsToFind.includes(str);
	const doesExtMatchOptions = (str: string): boolean =>
		(isToFindWildcard && !isIgnored(str)) || (isToFind(str) && !isIgnored(str));

	do {
		didRemove = false;
		lastFound = path.extname(fileName);

		if (!lastFound || lastFound === '') {
			// no extensions found, finish
			return fileName + replaceWith;
		}

		if (doesExtMatchOptions(lastFound)) {
			fileName = path.basename(fileName, lastFound);
			didRemove = true;
			doneRepetitions++;
		}
	} while (
		(shouldRepeat && didRemove) ||
		(shouldRepeat === ShouldRepeat.NumberOfTimes && doneRepetitions !== nRepetitions)
	);

	return fileName + replaceWith;
}

// MARK: removeFileExtension
// TODO removeFileExtension
// export function removeFileExtension(
// 	str: string,
// 	options?: ReplaceExtensionOptions,
// ): string {}

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
