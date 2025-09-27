import fs from 'node:fs/promises';
import path from 'node:path';

// MARK: TYPES

export interface RemoveExtensionOptions {
	extToFind?: string | Array<string>;
	extToIgnore?: string | Array<string>;
	repetitions?: number;
}

export interface ReplaceExtensionOptions extends RemoveExtensionOptions {
	extToFind?: string | Array<string>;
	extToIgnore?: string | Array<string>;
	replaceWith: string;
	repetitions?: number;
}

export const defaultReplaceExtensionOptions: ReplaceExtensionOptions = {
	extToFind: [],
	extToIgnore: [],
	replaceWith: '',
	repetitions: -1,
};

// MARK: FUNCTIONS

// MARK: isPathAccessible
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

// TODO Fn numberOfFileExtensions

// TODO Fn getFileExtension

// MARK: hasFileExtension
/**
 * Checks if a given file path has a file extension. When {@link extToFind} is set to *,
 * including by default, the function will return true if there is any extension
 * present in the given file path.
 *
 * Optionally, set {@link extToFind} to a single file extension to only return true if
 * that single extension is present. Further, you can specify an array of
 * file extensions so the function returns true if any of the given extensions are
 * found.
 *
 * @param filePath The filepath to check for the given extensions.
 * @param extToFind String or array of strings indicating which extensions to search for. Set to
 * "*" or keep at default value to return true for the presence of any extension.
 * @returns Whether the given file extensions were found for the given filepath.
 *
 * @example
 * // Checking for JSON extensions
 * const jsonExts = ['.json', '.jsonc'];
 * ['A file.json', 'Something in jsonc.jsonc']
 *      .forEach(each => {
 *          console.log(hasFileExtension(each, jsonExts)); // true 2x
 *      }
 * );
 */
// TODO Unit Test
export function hasFileExtension(
	filePath: string,
	extToFind: string | Array<string> = '*',
): boolean {
	// SECTION: Normalize args

	// Param: filePath
	if (filePath.trim() === '') {
		return false;
	}

	// Param: extToFind
	if (typeof extToFind === 'string') {
		if (extToFind.startsWith('.') && extToFind.endsWith('.')) {
			throw new Error(`Arg "extname" is an invalid file extension`);
		}

		if (extToFind === '') {
			extToFind = '*';
		}

		if (extToFind !== '*') {
			extToFind = normalizeFileExtension(extToFind);
		}
	} else {
		// is an array, but to be type-safe
		if (!Array.isArray(extToFind)) {
			throw new Error(`Unexpected! Expected arg "extsToIgnore" to be an array`);
		}

		if (extToFind.includes('') || extToFind.includes('*')) {
			extToFind = '*';
		} else {
			extToFind = extToFind.map(toFind => normalizeFileExtension(toFind));
		}
	}

	// SECTION: Do check

	const ext = path.extname(filePath);

	if (!ext) {
		return false;
	}

	if (typeof extToFind === 'string') {
		if (extToFind === '*') {
			return true;
		}

		return ext === extToFind;
	}

	if (Array.isArray(extToFind)) {
		return extToFind.includes(ext);
	}

	return false;
}

// MARK: normalizeFileExtension
export function normalizeFileExtension(
	extname: string,
	extToIgnore: string | Array<string> = [],
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
	// - errors on wildcard argument "*"
	if (typeof extToIgnore === 'string') {
		if (extToIgnore === '') {
			extToIgnore = [];
		} else if (extToIgnore === '*') {
			throw new Error(`Arg "extToIgnore" cannot be a wildcard`);
		} else {
			if (extToIgnore.startsWith('.') && extToIgnore.endsWith('.')) {
				throw new Error(`Arg "extToIgnore" is an invalid file extension`);
			}

			extToIgnore = extToIgnore.startsWith('.')
				? [extToIgnore]
				: ['.' + extToIgnore];
		}
	} else {
		if (!Array.isArray(extToIgnore)) {
			throw new Error(`Unexpected! Expected arg "extToIgnore" to be an array`);
		}

		if (extToIgnore.includes('*')) {
			throw new Error(`Arg "extToIgnore" cannot be a wildcard`);
		} else {
			extToIgnore = extToIgnore
				.map(toIgnore => normalizeFileExtension(toIgnore))
				.filter(toIgnore => toIgnore !== '');
		}
	}

	if (extname.startsWith('.') || extToIgnore.includes(extname)) {
		return extname;
	} else {
		return '.' + extname;
	}
}

// MARK: replaceFileExtension
export function replaceFileExtension(
	fileName: string,
	options: ReplaceExtensionOptions,
): string {
	const { repetitions } = options;
	let { extToFind, extToIgnore, replaceWith } = options;

	// SECTION: Normalize arguments

	// Param: fileName
	if (fileName === '') {
		return '';
	}

	// fileName = normalizeFileExtension(fileName);

	// Param: extsToIgnore
	// - errors on wildcard argument "*"
	if (typeof extToIgnore === 'undefined') {
		// none provided means none should be ignored
		extToIgnore = [];
	} else if (typeof extToFind === 'string') {
		// sanitize the string + normalize to equivalent array
		if (extToIgnore === '*') {
			throw new Error(`Arg "extToIgnore" cannot be a wildcard`);
		} else if (extToIgnore === '') {
			extToIgnore = [];
		} else {
			extToIgnore = [normalizeFileExtension(extToIgnore as string)];
		}
	} else {
		// is an array, but to be type-safe
		if (!Array.isArray(extToIgnore)) {
			throw new Error(`Unexpected! Expected arg "extToIgnore" to be an array`);
		} else {
			if (extToIgnore.includes('')) {
				extToIgnore = [];
			} else if (extToIgnore.includes('*')) {
				throw new Error(`Arg "extToIgnore" cannot be a wildcard`);
			} else {
				extToIgnore = extToIgnore.map(element => normalizeFileExtension(element));
			}
		}
	}

	// Param: extsToFind
	// - accepts wildcard argument "*" which means the function wil match any extension present
	// If extsToFind is any of the following, it becomes a wildcard str literal "*":
	// - An empty array or an array containing an empty string literal ""
	// - The string literal ""
	// - Undefined
	if (typeof extToFind === 'undefined') {
		extToFind = '*';
	} else if (typeof extToFind === 'string') {
		if (extToFind === '' || extToFind === '*') {
			extToFind = '*';
		} else {
			extToFind = [normalizeFileExtension(extToFind)];
		}
	} else {
		// is an array
		if (!Array.isArray(extToFind)) {
			throw new Error(`Unexpected! Expected arg "extToFind" to be an array`);
		}

		if (extToFind.length === 0) {
			extToFind = '*';
		} else {
			// at least one value in the array
			if (extToFind.includes('') || extToFind.includes('*')) {
				extToFind = '*';
			} else {
				// does not contain empty str or wildcard
				// filter out contradictions + map normalized values

				extToFind = extToFind
					.map(toFind => normalizeFileExtension(toFind))
					.filter(toFind => {
						if (
							(toFind !== '*' && extToIgnore.includes(toFind)) ||
							extToIgnore.includes(toFind)
						) {
							console.warn(
								`Conflicting value "${toFind}" found in both "extToFind" and "extToIgnore". It will be ignored.`,
							);
							return false;
						}
						return true;
					});
			}
		}
	}

	// Param: iterations
	// - if undefined, 0, or 1, do once and done
	// - if < 0, do as many times until no extensions found
	// - if > 0, do x amount of times and done
	enum ShouldRepeat {
		Never,
		NumberOfTimes,
		Infinitely,
	}

	let shouldRepeat: ShouldRepeat = ShouldRepeat.Never;
	let nRepetitions = 0;

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
	// - Accepting value "" is intended behavior which means "remove the extension"
	replaceWith = normalizeFileExtension(replaceWith);

	// SECTION: Start replacement
	let didRemove = false;
	let lastFound = '';
	let nIterations = 0;

	const isToFindWildcard = typeof extToFind === 'string' && extToFind === '*';
	const isIgnored = (str: string): boolean => extToIgnore.includes(str);
	const isToFind = (str: string): boolean =>
		isToFindWildcard || extToFind.includes(str);
	const doesExtMatchOptions = (str: string): boolean =>
		(isToFindWildcard && !isIgnored(str)) || (isToFind(str) && !isIgnored(str));

	do {
		if (nIterations > 25) {
			throw new Error(
				`Unexpected! Do-while looped an excessive number of times and was broken`,
			);
		}

		didRemove = false;
		lastFound = path.extname(fileName);

		if (!lastFound) {
			// no extensions found, finish
			return fileName + replaceWith;
		}

		if (doesExtMatchOptions(lastFound)) {
			fileName = path.basename(fileName, lastFound);
			didRemove = true;
			nIterations++;
		}
	} while (
		// prettier-ignore
		shouldRepeat !== ShouldRepeat.Never && (
			(shouldRepeat === ShouldRepeat.Infinitely && didRemove) ||
			(shouldRepeat === ShouldRepeat.NumberOfTimes && nIterations < (nRepetitions + 1))
		)
	);

	return fileName + replaceWith;
}

// MARK: removeFileExtension
// TODO jsdoc
export function removeFileExtension(
	fileName: string,
	options: RemoveExtensionOptions = defaultReplaceExtensionOptions,
): string {
	return replaceFileExtension(fileName, { ...options, replaceWith: '' });
}

// MARK: basenameWithoutExtensions
// TODO jsdoc
export function basenameWithoutExtensions(
	fileName: string,
	options: RemoveExtensionOptions = defaultReplaceExtensionOptions,
): string {
	const basename = path.basename(fileName);
	return removeFileExtension(basename, options);
}
