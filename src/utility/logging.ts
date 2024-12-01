import chalk from 'chalk';

const isDebugFlagOn = () : boolean => process.argv.includes('--debug') || process.argv.includes('-D');
const isDebugging = () : boolean => process.env.DEBUG === 'true' || isDebugFlagOn();

function getDebugPrefix(withColor: boolean = true) : string {
    const prefix = 'DEBUG: ';
    return withColor ? chalk.bgMagenta(prefix) : prefix;
}

/**
 * Logs a message to the console if debugging is active, which occurs if:
 * 1. The DEBUG environment variable is set to "true"
 * 2. The user passed a debug flag to the process with `--debug` or `-D`
 * @param {string} text The 
 * @param {boolean} withPrefix
 */
export function logDebug(text: string, withPrefix: boolean = false, withColor: boolean = true) {
    if (!isDebugging())
        return;

    console.log(withPrefix ? getDebugPrefix(withColor) : '' + text);
}

export function logDebugLines(linePrefix: string = ' - ', ...lines: Array<string>) {
    if (!isDebugging())
        return;

    for (const line of lines)
        console.log(linePrefix + line);
}

export function logDebugSectionWithData(header: string, linePrefix: string = ' > ', ...lines: Array<string>) {
    if (!isDebugging())
        return;
    
    if (header !== null && header.trim() !== '')
        console.log(header);

    for (const line of lines)
        console.log(linePrefix + line);
}