import chalk from 'chalk';

/**
 * Prints a message to `stdout` in the console.
 * @param message The things you want to display in the console.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clog = (message?: any) => console.log(message);

const getDebugPrefix = (withColor: boolean = true) : string => {
    const prefix = 'DEBUG: ';
    return withColor ? chalk.bgMagenta(prefix) : prefix;
}
const isDebugFlagOn = () : boolean => process.argv.includes('--debug') || process.argv.includes('-D');
export const isDebugging = () : boolean => process.env.DEBUG === 'true' || isDebugFlagOn();

/**
 * Logs a message to the console if debugging is active, which occurs if:
 * 1. The DEBUG environment variable is set to "true"
 * 2. The user passed a debug flag to the process with `--debug` or `-D`
 * @param {string} text The 
 * @param {boolean} withPrefix
 */
export function dlog(text: string, withPrefix: boolean = false, withColor: boolean = true) {
    if (!isDebugging())
        return;

    console.log(withPrefix ? getDebugPrefix(withColor) : '' + text);
}

export function dlogLines(linePrefix: string = ' - ', ...lines: string[]) {
    if (!isDebugging())
        return;

    for (const line of lines)
        console.log(linePrefix + line);
}

export function dlogSectionWithData(header: string, linePrefix: string = ' > ', ...lines: string[]) {
    if (!isDebugging())
        return;
    
    if (header !== null && header.trim() !== '')
        console.log(header);

    for (const line of lines)
        console.log(linePrefix + line);
}