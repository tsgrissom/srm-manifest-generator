import chalk from 'chalk';

const { argv } = process;

// TEST Unit
const doArgsInclude = (args: string[] = process.argv, ...argsToFind: string[]) : boolean => {
    for (const arg of args) {
        for (const argToFind of argsToFind) {
            if (arg === argToFind)
                return true;
        }
    }
    return false;
}

/**
 * Prints a message to `stdout` in the console.
 * @param message The things you want to display in the console.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clog = (message?: any, ...optionalParams: any[]) => console.log(message, optionalParams);

/**
 * Creates a styled debug prefix with eye-catching background color
 * to emphasize the beginning of an important debug line, or the
 * start of a debug print across multiple lines.
 * 
 * @param useColor Whether to apply color to the header prefix.
 * @returns The header prefix string.
 */
const getDebugPrefix = (useColor: boolean = true) : string => {
    const prefix = 'DEBUG:';
    return useColor ? chalk.bgMagenta(prefix) : ` ${prefix}`;
}

// TODO includeVerboseFlags option
// TODO Move flag sets out of body + simplify check
/**
 * Checks if one of at least one of the debugging flags was passed to the
 * current process.
 * 
 * @returns A `boolean` representing whether one of the debugging flags was passed
 *   to the process or not.
 */
// const isDebugFlagOn = () : boolean => process.argv.includes('--debug') || process.argv.includes('-D');
const isDebugFlagOn = () : boolean => doArgsInclude(argv, '-D', '--debug');

const isVerboseFlagOn = () : boolean => process.argv.includes('--verbose') || process.argv.includes('-v')

/**
 * Checks if the `DEBUG` environment variable is set to `true` in
 * the current process.
 * 
 * @returns A `boolean` representing whether the debugging environment
 *   variable is enabled. 
 */
const isEnvDebug = () : boolean => process.env.DEBUG === 'true';

const isEnvVerbose = () : boolean => process.env.VERBOSE === 'true';

/**
 * Checks if debugging is active is active by checking if either is true:
 * 
 * 1. The process flag `--debug` or -D` was passed to the current execution.
 * 2. The `DEBUG` environment variable is set to `true`.
 * 
 * See also: {@link isEnvDebug} as well as {@link isDebugFlagOn}
 * 
 * @returns A `boolean` representing whether debugging is active or not.
 */
const isDebugging = () : boolean => isEnvDebug() || isDebugFlagOn();

/**
 * Logs a message to the console if debugging is active, which occurs if
 * the current process is debugging: {@link isDebugging}
 * 
 * @param message The message to log to console if debugging.
 * @param isHeader Whether to prepend the message with a big prefix that says
 *   debug. Optionally, disable the background color with ${@link useColor}.
 * @param useColor Whether to add color to the header prefix. Has no effect if
 *   {@link isHeader} is disabled.
 */
function dlog(message: string, isHeader: boolean = false, useColor: boolean = true) {
    if (!isDebugging())
        return;

    const prefix = isHeader ? getDebugPrefix(useColor) : '';
    clog(prefix + message);
}

function dlogLines(linePrefix: string = ' - ', ...lines: string[]) {
    if (!isDebugging())
        return;

    for (const line of lines)
        clog(linePrefix + line);
}

function dlogSectionWithData(header: string, linePrefix: string = ' > ', ...lines: string[]) {
    if (!isDebugging())
        return;
    
    if (header !== null && header.trim() !== '')
        clog(header);

    for (const line of lines)
        clog(linePrefix + line);
}

export {
    clog,
    isDebugFlagOn, isEnvDebug as isDebugEnvOn, isDebugging, getDebugPrefix,
    dlog, dlogLines, dlogSectionWithData
}