import { isDebugActive, isEnvVerbose, isProcessVerbose } from '../../utility/debug';
import Manifest from '../manifest/Manifest';
import ConfigData from './ConfigData';
import OutputMode from './OutputMode';

class UserConfig implements ConfigData {
	search: { manifests: Manifest[]; scanDirectories: boolean; scanRecursively: boolean };
	output: { minify: boolean; indentSpaces: number; mode: OutputMode };
	validate: {
		filePaths: boolean;
		executables: boolean;
		executableExtensions: string[];
		unknownConfigKeys: boolean;
	};
	other: { useColor: boolean; debug: boolean; verbose: boolean };
	logs: { enabled: boolean; nameFormat: string; outputPath: string };

	constructor() {
		this.search = {
			manifests: [],
			scanDirectories: true,
			scanRecursively: false
		};
		this.output = {
			minify: true,
			indentSpaces: 2,
			mode: OutputMode.Combine
		};
		this.validate = {
			filePaths: true,
			executables: true,
			executableExtensions: ['.exe'],
			unknownConfigKeys: true
		};
		this.other = {
			useColor: true,
			debug: false,
			verbose: false
		};
		this.logs = {
			enabled: true,
			outputPath: './',
			nameFormat: 'srmmg_YYYY-MM-DD_HH-MM-SS.log'
		};
	}

	// TODO constructor arg which sets options based on a given ConfigData? then falls back on the defaults?
	// TODO jsdocs below

	// MARK: "search"
	public getManifestPaths = (): string[] => this.search.manifests.map(man => man.filePath);

	// MARK: "output"
	public shouldMinifyOutput = (): boolean => this.output.minify;
	public getIndentSpaces = (): number => this.output.indentSpaces;
	public getOutputMode = (): OutputMode => this.output.mode;

	// MARK: "validate"
	public shouldValidateFilePaths = (): boolean => this.validate.filePaths;
	public shouldValidateExecutables = (): boolean => this.validate.executables;
	public shouldWarnUnknownConfigKey = (): boolean => this.validate.unknownConfigKeys;
	public getValidExecutableExtensions = (): string[] => this.validate.executableExtensions;

	// MARK: "other"
	public shouldUseColor = (): boolean => this.other.useColor;
	public isDebugActive = (): boolean => this.other.debug || isDebugActive(true);
	public isVerboseActive = (): boolean => this.other.verbose || isEnvVerbose() || isProcessVerbose();

	// MARK: "logs"
	public areLogsEnabled = (): boolean => this.logs.enabled;
	public getLogOutputPath = (): string => this.logs.outputPath;
	public getLogFilenameFormat = (): string => this.logs.nameFormat;
}

export default UserConfig;
