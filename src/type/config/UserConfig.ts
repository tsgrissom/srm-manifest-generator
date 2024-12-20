import { isDebugActive, isEnvVerbose, isProcessVerbose } from '../../util/debug.js';
import Manifest from '../manifest/Manifest.js';
import ConfigData from './ConfigData.js';
import OutputMode from './OutputMode.js';

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

	// MARK: "search"
	public getManifestPaths = (): Array<string> =>
		this.search.manifests.map(man => man.filePath);

	// MARK: "output"
	public shouldMinifyOutput = (): boolean => this.output.minify;
	public getIndentSpaces = (): number => this.output.indentSpaces;
	public getOutputMode = (): OutputMode => this.output.mode;

	// MARK: "validate"
	public shouldValidateFilePaths = (): boolean => this.validate.filePaths;
	public shouldValidateExecutables = (): boolean => this.validate.executables;
	public shouldWarnUnknownConfigKey = (): boolean => this.validate.unknownConfigKeys;
	public getValidExecutableExtensions = (): Array<string> =>
		this.validate.executableExtensions;

	// MARK: "other"
	public shouldUseColor = (): boolean => this.other.useColor;
	public isDebugActive = (): boolean => this.other.debug || isDebugActive(true);
	public isVerboseActive = (): boolean =>
		this.other.verbose || isEnvVerbose() || isProcessVerbose();

	// MARK: "logs"
	public areLogsEnabled = (): boolean => this.logs.enabled;
	public getLogOutputPath = (): string => this.logs.outputPath;
	public getLogFilenameFormat = (): string => this.logs.nameFormat;
}

export default UserConfig;
