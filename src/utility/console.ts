/**
 * Logs messages to standard output stream.
 * @param messages The messages you want to log to `stdout`.
 */
const clog = (...messages: string[]) =>
	messages.forEach(each => console.log(each));

/**
 * Logs formatted lists of messages to standard output stream by
 * prefixing each line with a {@link linePrefix}.
 * @param linePrefix The string to prepend each line with.
 * @param messages The messages you want to log to `stdout`.
 */
const clogList = (linePrefix = ' - ', ...messages: string[]) =>
	messages.forEach(each => console.log(linePrefix + each));

/**
 * Logs messages to standard error stream at the error log level. 
 * @param messages The message you want to log to `stderr`.
 */
const clogErr = (...messages: string[]) =>
	messages.forEach(each => console.error(each));

/**
 * Logs messages to standard error stream at the warn log level. 
 * @param messages The message you want to log to `stderr`.
 */
const clogWarn = (...messages: string[]) =>
	messages.forEach(each => console.warn(each));

export { clog, clogList, clogErr, clogWarn };
