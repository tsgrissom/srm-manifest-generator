import { Manifest } from '../../app/type/Manifest.js';
import {
	isDebugActive,
	isEnvVerbose,
	isProcessVerbose,
} from '../../util/logging/debug.js';
import { ConfigData, OutputMode } from './ConfigData.js';

// TODO Location should be customizable with env var
// TODO Track load messages like Value of key must be x but was y issues so they can be printed on demand instead of automatically every time
// TODO Re-write interface to support current type definition as well as metadata about the key/value and its role (name, desc, default)
// TODO Move "other" into "log.console" and move current "logs" to "log.file"
// TODO Change "output" into "transform"
// TODO Change "search.scanDirectories" to "search.inDirectories" + "search.scanRecursively" to "search.recursively"
// TODO Change "validate.executables" to be a section, contains "validate.executables.enabled" + "validate.executables.acceptedExtensions"
// TODO Fix property privacy + add getters
// TODO jsdocs
class UserConfig implements ConfigData {
	search: {
		manifests: Array<Manifest>;
		scanDirectories: boolean;
		scanRecursively: boolean;
	};
	output: { minify: boolean; indentSpaces: number; mode: OutputMode };
	validate: {
		filePaths: boolean;
		executables: boolean;
		executableExtensions: Array<string>;
		unknownConfigKeys: boolean;
	};
	other: { useColor: boolean; debug: boolean; verbose: boolean };
	logs: { enabled: boolean; nameFormat: string; outputPath: string };

	constructor() {
		this.search = {
			manifests: [],
			scanDirectories: true,
			scanRecursively: false,
		};
		this.output = {
			minify: true,
			indentSpaces: 2,
			mode: OutputMode.Combine,
		};
		this.validate = {
			filePaths: true,
			executables: true,
			executableExtensions: ['.exe'],
			unknownConfigKeys: true,
		};
		this.other = {
			useColor: true,
			debug: false,
			verbose: false,
		};
		this.logs = {
			enabled: true,
			outputPath: './',
			nameFormat: 'srmmg_YYYY-MM-DD_HH-MM-SS.log',
		};
	}

	// TODO constructor arg which sets options based on a given ConfigData? then falls back on the defaults?
	// TODO jsdocs below

	// Section: search
	public getManifestPaths = (): Array<string> =>
		this.search.manifests.map(man => man.getFilePath);

	// Section: output
	public shouldMinifyOutput = (): boolean => this.output.minify;
	public getIndentSpaces = (): number => this.output.indentSpaces;
	public getOutputMode = (): OutputMode => this.output.mode;

	// Section: validate
	public shouldValidateFilePaths = (): boolean => this.validate.filePaths;
	public shouldValidateExecutables = (): boolean => this.validate.executables;
	public shouldWarnUnknownConfigKey = (): boolean => this.validate.unknownConfigKeys;
	public getValidExecutableExtensions = (): Array<string> =>
		this.validate.executableExtensions;

	// Section: other
	public shouldUseColor = (): boolean => this.other.useColor;
	public isDebugActive = (): boolean => this.other.debug || isDebugActive(true);
	public isVerboseActive = (): boolean =>
		this.other.verbose || isEnvVerbose() || isProcessVerbose();

	// Section: logs
	public areLogsEnabled = (): boolean => this.logs.enabled;
	public getLogOutputPath = (): string => this.logs.outputPath;
	public getLogFilenameFormat = (): string => this.logs.nameFormat;
}

export { UserConfig };
