import { exec } from 'node:child_process';

import chalk from 'chalk';

import { delimitedList } from './string-utilities.js';

// MARK: Debugging
// TODO jsdoc

export function isDebugging() {
    return process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('-D');
}

export function logDebugPlain(message) {
    if (isDebugging()) {
        console.log(message);
    }
}

export function logDebugHeader(header) {
    if (isDebugging()) {
        console.log('');
        console.log(chalk.magenta('DEBUG: ') + header);
    }
}

export function logDebug(message, withPrefix = true, withColor = true) { // TODO Do I even need withColor here?
    if (isDebugging()) {
        const prefix = 'DEBUG: ';
        let builder = withPrefix ? (withColor ? chalk.magentaBright(prefix) : prefix) : '';
        builder += message;

        console.log(builder);
    }
}

export function logDebugLines(...message) {
    if (isDebugging()) {
        for (const line of message) {
            console.log(line);
        }
    }
}

export function logDebugSectionWithData(header, ...data) {
    if (isDebugging()) {
        console.log(chalk.magenta('DEBUG: ') + header);
        for (const line of data) {
            console.log(` > ${line}`);
        }
    }
}

// MARK: isProcessRunning

/**
 * Checks if a process is running on the system, with support for flexible Node
 * process.platform-based multiplatform support. See example below for example
 * options object.
 * 
 * @param {object} platformOptions Indicates the commands for finding a process on a given system. See example.
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
export async function isProcessRunning(platformOptions = null) {
    const refJsdoc = 'Refer to the isProcessRunning jsdoc for an example of platformOptions.';

    // Lint platformOptions type
    if (!platformOptions)
        throw new Error(`Arg platformOptions must be provided. ${refJsdoc}`);
    if (typeof platformOptions !== 'object')
        throw new TypeError(`Arg platformOptions must be an object. ${refJsdoc}`);
    if (Array.isArray(platformOptions))
        throw new TypeError(`Arg platformOptions must be an object but was an array. ${refJsdoc}`);

    const {settings, supportedPlatforms} = platformOptions;

    // Lint platformOptions.settings type
    if (!settings)
        throw new Error(`Arg platformOptions must include object keyed to "settings". ${refJsdoc}`);
    if (typeof settings !== 'object')
        throw new TypeError(`Arg platformOptions.settings must be an object. ${refJsdoc}`);
    if (Array.isArray(settings))
        throw new TypeError(`Arg platformOptions.settings must be an object but was an array. ${refJsdoc}`);

    // Lint platformOptions.supportedPlatforms
    if (!supportedPlatforms)
        throw new Error(`Arg platformOptions must include array keyed to "supportedPlatforms" which lists supported Node process.platform options.`);
    if (!Array.isArray(supportedPlatforms))
        throw new TypeError(`Arg platformOptions.supportedPlatforms must be an array`);

    // Lint values inside of platformOptions.settings.EACH-SUPPORTED-PLATFORM
    for (const supportedPlatform of supportedPlatforms) {
        // TODO Validate is supported platform exists in Node
        const section = settings[supportedPlatform];
        const sectionKeyName = `platformOptions.settings.${supportedPlatform}`;

        if (!section)
            throw new Error(`Arg ${sectionKeyName} was missing for a platform listed in platformOptions.supportedPlatforms: ${supportedPlatform}`);

        if (!section.commandExec)
            throw new Error(`Arg ${sectionKeyName} was missing required option "commandExec". ${refJsdoc}`);
        if (!section.processSearchName)
            throw new Error(`Arg ${sectionKeyName} was missing required option "processSearchName". ${refJsdoc}`);
    }

    const {platform} = process;
    
    if (!supportedPlatforms.includes(platform))
        throw new Error(`Your platform (${platform}) is unsupported at the moment. Supported platforms: ${delimitedList(supportedPlatforms)}`);

    const {commandExec, processSearchName} = platformOptions.settings[platform];

    return new Promise((resolve, reject) => {
        exec(commandExec, (err, stdout, stderr) => {
            if (err) {
                if (err.code === 1)
                    return resolve(false);

                console.error(`Error executing ${commandExec}:`, err);
                return reject(err);
            }

            if (stderr) {
                console.error(`Error in output from command "${commandExec}":`, stderr);
                return reject(new Error(stderr));
            }

            const isRunning = stdout.toLowerCase().includes(processSearchName);
            resolve(isRunning);
        });
    });
}