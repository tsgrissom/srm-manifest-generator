import chalk from 'chalk';
import { exec } from 'child_process';

export function logDebug(message, withPrefix = true, withColor = true) {
    const isDebugging = process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('-D');

    if (isDebugging) {
        const prefix = 'DEBUG: ';
        let builder = withPrefix ? (withColor ? chalk.magentaBright(prefix) : prefix) : '';
        builder += message;

        console.log(builder);
    }
}

export function getCountString(numberOfThings, singularNoun, pluralNoun = null) {
    if (typeof(numberOfThings) !== 'number') {
        throw new Error(`Unable to getCountString for non-numeric number of things parameter: ${numberOfThings}`);
    }

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (numberOfThings === 0 || numberOfThings > 1) ? pluralNoun : singularNoun;
    return `${numberOfThings} ${verbiage}`;
};

export function isSteamRunning() {
    return new Promise((resolve, reject) => {
        const {platform} = process;
        
        // "ps" will be the command for Linux and macOS
        // "steam" is a valid search term for Linux and macOS
        let platformName = null,
            command = null,
            commandName = 'ps',
            searchFor = 'steam';

        switch (platform) {
            case 'win32':
                platformName = 'Windows';
                command = 'tasklist';
                commandName = 'tasklist';
                searchFor = 'steam.exe';
                break;
            case 'darwin':
                platformName = 'macOS';
                command = 'ps aux | grep "[S]team"';
                break;
            case 'linux':
                platformName = 'Linux';
                command = 'ps aux | grep "[s]team"';
                break;
            default:
                return reject(`Function isSteamRunning does not support platform "${platform}". Supported platforms are: Windows, macOS, and Linux.`);
        }

        if (platformName === null || command === null || commandName === null || searchFor === null) {
            return reject('Before searching for Steam process, one of the following was was null: platform name, command, command name, or search term');
        }

        exec(command, (err, stdout, stderr) => {
            if (err) {
                if (err.code === 1) {
                    // Error code 1 means not found
                    return resolve(false);
                }
                console.error(`Error executing ${commandName}:`, err);
                return reject(err);
            }
            if (stderr) {
                console.error(`Error output from ${commandName}`, stderr);
                return reject(new Error(stderr));
            }

            const isRunning = stdout.toLowerCase().includes(searchFor);
            resolve(isRunning);
        });
    });
}