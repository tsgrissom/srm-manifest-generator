import clr from 'chalk';
import { doArgsInclude } from '../process.js';
import { clog } from './console.js';

const FLAGS_DEBUG = ['-D', '--debug', '--debugging'],
	FLAGS_VERBOSE = ['-v', '--verbose'];

// MARK: Checks

/**
 * Checks if one of at least one of the debugging flags was passed to the
 * current process.
 * @returns A `boolean` representing whether one of the debugging flags was passed
 *   to the process or not.
 */
// const isProcessDebugging = () => doArgsInclude(process.argv, ...FLAGS_DEBUG);

function isProcessDebugging(): boolean {
	return doArgsInclude(process.argv, ...FLAGS_DEBUG);
}

/**
 * Checks if one of at least one of the verbose flags was passed to the
 * current process.
 * @returns A `boolean` representing whether one of the debugging flags was passed
 *   to the process or not.
 */
function isProcessVerbose(): boolean {
	return doArgsInclude(process.argv, ...FLAGS_VERBOSE);
}

/**
 * Checks if the `DEBUG` environment variable is set to `true` in
 * the current environment.
 * @returns A `boolean` representing whether the debugging environment
 *   variable is enabled.
 */
function isEnvDebug(): boolean {
	return process.env.DEBUG === 'true';
}

/**
 * Checks if the the `VERBOSE` environment variable is set to `true`
 * in the current environment.
 * @returns A `boolean` representing whether the `VERBOSE` environment
 *   variable is enabled.
 */
function isEnvVerbose(): boolean {
	return process.env.VERBOSE === 'true';
}

/**
 * Checks if verbosity is active by checking if either is true:
 * 1. The `VERBOSE` environment variable is set to `true`.
 * 2. The process was passed either command flag `--verbose` or
 *     switch `-D`
 * @returns A `boolean` representing whether verbosity is active or not.
 */
function isVerbose(): boolean {
	return isEnvVerbose() || isProcessVerbose();
}

/**
 * Checks if debugging is active by checking if any one of the following
 * is true:
 *
 * 1. The `DEBUG` environment variable is set to `true`.
 * 2. The process was passed either command flag `--debug` or
 *     switch `-D`
 * 3. If {@link isVerboseCountedAsDebugging} is left enabled + either the
 *     `VERBOSE` environment variable is `true` or a `--verbose` flag
 *     was passed to the process.
 *
 * See also: {@link isEnvDebug} as well as {@link isProcessDebugging}
 *
 * @param isVerboseCountedAsDebugging Whether process verbosity should count
 *   as debugging, such as if the `VERBOSE` environment variable is set to
 *   `true`, or a `--verbose` flag is passed to the process. Default: true.
 * @returns A `boolean` representing whether debugging is active or not.
 */
function isDebugActive(isVerboseCountedAsDebugging = true): boolean {
	return (
		isEnvDebug() ||
		isProcessDebugging() ||
		(isVerboseCountedAsDebugging && isVerbose())
	);
}

// MARK: Debug Logs

/**
 * Logs messages to standard output if debugging is active, which
 * occurs if the current process or environment is debugging.
 *
 * See: {@link isDebugActive}
 *
 * @param lines The messages you want to log to `stdout`.
 */
const dlog = (...lines: Array<string>): void => {
	if (isDebugActive()) {
		lines.forEach(line => clog(line));
	}
};

/**
 * If debugging is active, logs an emphasized header message styled
 * with magenta color and underline formatting.
 *
 * See: {@link isDebugActive}
 *
 * @param header The primary message and body of the header.
 * @param newlineBefore Whether to log a newline immediately
 *  before loggin the header to visually separate the output.
 * * Default: false
 */
const dlogHeader = (header: string, newlineBefore = true): void => {
	if (!header || (typeof header === 'string' && header.trim() === '')) return;

	if (newlineBefore) dlog('');

	dlog(clr.magenta.underline(header));
};

/**
 * If debugging is active, this function logs formatted lists of
 * messages to standard output by prefixing each line with a {@link linePrefix}.
 * @param linePrefix The prefix to apply to each line.
 * @param lines The lines you want to log to `stdout`.
 */
const dlogList = (linePrefix = ' - ', ...lines: Array<string>) =>
	void lines.forEach(e => dlog(linePrefix + e));

/**
 * If debugging is active, this function logs formatted data sections
 * to the standard output, starting with an emphasized {@link header}
 * followed by a formatted list of {@link lines} with support for
 * a custom line prefix: {@link linePrefix}.
 * @param header The text to display in the header.
 * @param linePrefix The prefix to apply to each line.
 * @param lines The lines you want to log to `stdout`.
 */
const dlogDataSection = (
	header: string,
	linePrefix = ' > ',
	...lines: Array<string>
): void => {
	dlog(header);
	dlogList(linePrefix, ...lines);
};

// MARK: Verbose Logs

function vlog(...lines: Array<string>): void {
	if (!isVerbose()) {
		return;
	}

	lines.forEach(line => console.log(line));
}

function vlogList(linePrefix = ' - ', ...lines: Array<string>): void {
	lines.forEach(line => vlog(linePrefix + line));
}

export {
	dlog,
	dlogDataSection,
	dlogHeader,
	dlogList,
	FLAGS_DEBUG,
	FLAGS_VERBOSE,
	isDebugActive,
	isEnvDebug,
	isEnvVerbose,
	isProcessDebugging,
	isProcessVerbose,
	isVerbose,
	vlog,
	vlogList,
};
