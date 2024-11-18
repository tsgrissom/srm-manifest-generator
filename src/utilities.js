import { exec } from 'child_process';

function getCountString(count, singularNoun, pluralNoun = null) {
    if (typeof(count) !== 'number') {
        console.error('Cannot pluralize count which is not a number');
        return 'ERROR';
    }

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (count === 0 || count > 1) ? pluralNoun : singularNoun;
    return `${count} ${verbiage}`;
};

function isSteamRunning() {
    return new Promise((resolve, reject) => {
        const {platform} = process;
        let platformName = null;
        let command = null;
        // "ps" will be the command used unless platform is Windows
        let commandName = 'ps';
        // "steam" is a valid search term for Linux and macOS
        let searchFor = 'steam';

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

export { getCountString, isSteamRunning };