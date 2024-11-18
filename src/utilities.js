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
    switch (process.platform) {
        case 'win32':
            // TODO: Write win32 impl
            return false;
        case 'linux':
            // TODO: Write linux impl
            console.warn('Platform is not yet supported for function isSteamRunning: Linux');
            return false;
        case 'darwin':
            // TODO: Write macOS impl
            console.warn('Platform is not yet supported for function isSteamRunning: macOS');
            return false;
        default:
            console.error(`Unable to determine if Steam is running on unknown process platform: ${process.platform}`);
            return false;
    }
}

export { getCountString, isSteamRunning };