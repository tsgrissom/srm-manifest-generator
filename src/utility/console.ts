/**
 * Logs messages to standard output.
 * @param messages The messages you want to log to `stdout`.
 */
const clog = (...messages: string[]) => messages.forEach(each => console.log(each));

/**
 * Logs formatted lists of messages to standard output by
 * prefixing each line with a {@link linePrefix}.
 * @param linePrefix The string to prepend each line with.
 * @param messages The messages you want to log to `stdout`.
 */
const clogList = (linePrefix = ' - ', ...messages: string[]) =>
	messages.forEach(each => console.log(linePrefix + each));

// TODO clogWarn

// TODO clogError

export { clog, clogList };
