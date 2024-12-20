import { exec } from 'node:child_process';

import { joinPathKeys } from '../config/util/yamlKeys.js'; // TODO Replace
import { delimitedList } from './string.js';

import FindProcessCommand from './type/FindProcessCommand.js';
import { defaultOptions, FindProcessOptions } from './type/FindProcessOptions.js';

// MARK: Fn doArgsInclude

/**
 * Checks if any one of the given values within `argsToFind` can
 * also be found within the given `args`.
 *
 * @param argsToSearch The arguments to search through, usually
 *   `process.argv`, which is the default value.
 * @param argsToFind The arguments to search for, any one of which
 *   being present in the `args`
 *
 * @returns A `boolean` indicating if any of the `argsToFind` were
 *   found within `argsToSearch`.
 *
 * @example
 * const debugFlags = ['-D', '--debug', '-v', '--verbose'];
 * if (doArgsInclude(process.argv, ...debugFlags)) {
 *      // Do your debugging
 * }
 */
// TEST Unit
const doArgsInclude = (
	argsToSearch: Array<string> = process.argv,
	...argsToFind: Array<string>
): boolean => {
	if (argsToSearch === process.argv && argsToSearch.length <= 2) return false;
	if (argsToFind.length === 0) return false;

	for (const arg of argsToSearch) {
		for (const argToFind of argsToFind) {
			if (arg === argToFind) return true;
		}
	}
	return false;
};

// MARK: Fn doesPlatformExist

/** A list of recognized Node platforms for use with {@link doesPlatformExist} */
const KNOWN_NODE_PLATFORMS = [
	'aix',
	'darwin',
	'freebsd',
	'linux',
	'openbsd',
	'sunos',
	'win32',
	'cygwin',
	'netbsd',
];

/**
 * Checks if a given platform name is recognized as a
 * {@link KNOWN_NODE_PLATFORMS}.
 * @param platform The platform name to check for.
 * @returns Whether the platform name was found in
 *  {@link KNOWN_NODE_PLATFORMS}.
 */
function doesPlatformExist(platform: string): boolean {
	return KNOWN_NODE_PLATFORMS.includes(platform);
}

// MARK: validatePlatformSupportedByFindProcessOptions()

function validatePlatformSupportedByFindProcessOptions(
	platform: string,
	platformOptions: FindProcessOptions,
): boolean {
	// TODO Validate is supported platform exists in Node
	const key = platformOptions.settings[platform];
	const fullKey = joinPathKeys('platformOptions', 'settings', platform);
	const supportedKey = joinPathKeys('platformOptions', 'supportedPlatforms');

	if (!key) {
		throw new Error(
			`Platform ${platform} was missing for a platform listed at ${supportedKey} (Expected: ${fullKey})`,
		);
	}

	if (!key.command) {
		throw new Error(`Arg ${fullKey} was missing required option "command".`);
	}

	if (!key.processName) {
		throw new Error(`Arg ${fullKey} was missing required option "processName".`);
	}

	return true;
}

// MARK: Fn getProcessStatus

async function getProcessStatus(
	platformCommandOptions: FindProcessCommand,
): Promise<boolean> {
	const { command, processName, shell } = platformCommandOptions;
	return new Promise((resolve, reject) => {
		exec(command, { shell: shell }, (err, stdout, stderr) => {
			if (err) {
				if (err.code === 1) {
					return resolve(false);
				}

				console.error(`Error executing ${command}:`, err);
				return reject(err);
			}

			if (stderr) {
				console.error(`Error in output from command "${command}":`, stderr);
				return reject(new Error(stderr));
			}

			const isRunning = stdout.toLowerCase().includes(processName.toLowerCase());
			resolve(isRunning);
		});
	});
}

// MARK: Fn isProcessRunning

/**
 * Checks if a process is running on the system, with support for flexible Node
 * `process.platform`-based multiplatform support. See example below for example
 * options object.
 *
 * Example: {@link FindProcessDefaultOptions}
 *
 * @param platformOptions Indicates the commands for finding a process on a given system. See example.
 * @returns Promise which resolves to a boolean which indicates whether the given
 * process is running on the system.
 */
async function isProcessRunning(platformOptions = defaultOptions): Promise<boolean> {
	if (platformOptions === null) {
		throw new Error(`Arg "platformOptions" must be provided.`);
	}

	if (typeof platformOptions !== 'object') {
		throw new TypeError(`Arg "platformOptions" must be an object.`);
	}

	if (Array.isArray(platformOptions)) {
		throw new TypeError(`Arg "platformOptions" must be an object but was an array.`);
	}

	const { supportedPlatforms } = platformOptions;

	const okSupportedPlatforms = platformOptions.supportedPlatforms.filter(each =>
		validatePlatformSupportedByFindProcessOptions(each, platformOptions),
	);

	const { platform } = process;

	if (!okSupportedPlatforms.includes(platform)) {
		throw new Error(
			`Your platform (${platform}) is unsupported. Supported platforms: ${delimitedList(supportedPlatforms)}`,
		);
	}

	return await getProcessStatus(platformOptions.settings[platform]);
}

export { doArgsInclude, doesPlatformExist, isProcessRunning, KNOWN_NODE_PLATFORMS };
