import { exec } from 'node:child_process';

import { delimitedList } from './string.js';

// MARK: doArgsInclude

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
	argsToSearch: string[] = process.argv,
	...argsToFind: string[]
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

// MARK: isProcessRunning

interface PlatformSearchProcessCommand {
	command: string;
	processName: string;
}

interface PlatformSearchProcessCommandMap {
	supportedPlatforms: string[];
	settings: Record<string, PlatformSearchProcessCommand>;
}

/**
 * Checks if a process is running on the system, with support for flexible Node
 * process.platform-based multiplatform support. See example below for example
 * options object.
 * 
 * @param platformOptions Indicates the commands for finding a process on a given system. See example.
 * @returns {Promise} Promise which resolves to a boolean which indicates whether the given
 * process is running on the system.
 * @example
 * // platformOptions Example
 * {
 *      supportedPlatforms: ['win32', 'darwin', 'linux'],
 *      settings: {
            win32: { commandExec: 'tasklist', processSearchName: 'steam.exe' },
            darwin: { commandExec: 'ps aux | grep [S]team', processSearchName: 'steam' },
            linux: { commandExec: 'ps aux | grep [s]team', processSearchName: 'steam' }
        }
 * };
 */
async function isProcessRunning(
	platformOptions: PlatformSearchProcessCommandMap
): Promise<boolean> {
	const refJsdoc =
		'Refer to the isProcessRunning jsdoc for an example of platformOptions.';

	// Lint platformOptions type
	if (!platformOptions)
		throw new Error(`Arg platformOptions must be provided. ${refJsdoc}`);
	if (typeof platformOptions !== 'object')
		throw new TypeError(
			`Arg platformOptions must be an object. ${refJsdoc}`
		);
	if (Array.isArray(platformOptions))
		throw new TypeError(
			`Arg platformOptions must be an object but was an array. ${refJsdoc}`
		);

	const { settings, supportedPlatforms } = platformOptions;

	// Lint platformOptions.settings type
	if (!settings)
		throw new Error(
			`Arg platformOptions must include object keyed to "settings". ${refJsdoc}`
		);
	if (typeof settings !== 'object')
		throw new TypeError(
			`Arg platformOptions.settings must be an object. ${refJsdoc}`
		);
	if (Array.isArray(settings))
		throw new TypeError(
			`Arg platformOptions.settings must be an object but was an array. ${refJsdoc}`
		);

	// Lint platformOptions.supportedPlatforms
	if (!supportedPlatforms)
		throw new Error(
			`Arg platformOptions must include array keyed to "supportedPlatforms" which lists supported Node process.platform options.`
		);
	if (!Array.isArray(supportedPlatforms))
		throw new TypeError(
			`Arg platformOptions.supportedPlatforms must be an array`
		);

	// Lint values inside of platformOptions.settings.EACH-SUPPORTED-PLATFORM
	for (const supportedPlatform of supportedPlatforms) {
		// TODO Validate is supported platform exists in Node
		const section = settings[supportedPlatform];
		const sectionKeyName = `platformOptions.settings.${supportedPlatform}`;

		if (!section)
			throw new Error(
				`Arg ${sectionKeyName} was missing for a platform listed in platformOptions.supportedPlatforms: ${supportedPlatform}`
			);

		if (!section.command)
			throw new Error(
				`Arg ${sectionKeyName} was missing required option "command". ${refJsdoc}`
			);
		if (!section.processName)
			throw new Error(
				`Arg ${sectionKeyName} was missing required option "processName". ${refJsdoc}`
			);
	}

	const { platform } = process;

	if (!supportedPlatforms.includes(platform))
		throw new Error(
			`Your platform (${platform}) is unsupported at the moment. Supported platforms: ${delimitedList(supportedPlatforms)}`
		);

	const { command, processName } = platformOptions.settings[platform];

	return new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) {
				if (err.code === 1) return resolve(false);

				console.error(`Error executing ${command}:`, err);
				return reject(err);
			}

			if (stderr) {
				console.error(
					`Error in output from command "${command}":`,
					stderr
				);
				return reject(new Error(stderr));
			}

			const isRunning = stdout.toLowerCase().includes(processName);
			resolve(isRunning);
		});
	});
}

export { doArgsInclude, isProcessRunning };
