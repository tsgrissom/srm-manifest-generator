import FindProcessCommand from './FindProcessCommand';

// TODO Condense FindProcessCommand into a single object, omitting current supportedPlatforms list
/**
 * Options for the {@link isProcessRunning} function,
 * enumerating the supported platforms to search for
 * a process on, including the command to execute,
 * the process name to search for, and any special
 * shell to use.
 * 
 * Default: {@link defaultOptions}
 */
interface FindProcessOptions {
	/**
	 * List of process platforms ({@link process.platform}) to
	 * support, the name of which must correspond to a key in
	 * the {@link settings}.
	 */
	supportedPlatforms: Array<string>;
	/**
	 * The options for a given platform, including the command
	 * to execute, the process name to search for, and any
	 * special shell to use.
	 */
	settings: Record<string, FindProcessCommand>;
}

/**
 * A set of default {@link FindProcessOptions} which support
 * the following platforms:
 * 
 * - `win32` (Windows)
 * - `darwin` (macOS)
 * - `linux` (Linux)
 */
const defaultOptions: FindProcessOptions = {
	supportedPlatforms: ['win32', 'darwin', 'linux'],
	settings: {
		win32: { command: 'tasklist', processName: 'steam.exe' },
		darwin: { command: 'ps aux | grep [S]team', processName: 'steam', shell: '/bin/sh' },
		linux: { command: 'ps aux | grep [s]team', processName: 'steam', shell: '/bin/sh' }
	}
};

export { FindProcessOptions, defaultOptions };