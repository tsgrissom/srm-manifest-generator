/**
 * Logs messages to standard output stream.
 * @param lines The messages you want to log to `stdout`.
 */
const clog = (...lines: Array<string>) => void lines.forEach(line => console.log(line));

/**
 * Logs formatted lists of messages to standard output stream by
 * prefixing each line with a {@link linePrefix}.
 * @param linePrefix The string to prepend each line with.
 * @param lines The messages you want to log to `stdout`.
 */
const clogList = (linePrefix = ' - ', ...lines: Array<string>) =>
	void lines.forEach(line => console.log(linePrefix + line));

/**
 * Logs messages to standard error stream at the error log level.
 * @param lines The message you want to log to `stderr`.
 */
const clogErr = (...lines: Array<string>) =>
	void lines.forEach(line => console.error(line));

/**
 * Logs messages to standard error stream at the warn log level.
 * @param lines The message you want to log to `stderr`.
 */
const clogWarn = (...lines: Array<string>) =>
	void lines.forEach(line => console.warn(line));

export { clog, clogErr, clogList, clogWarn };
