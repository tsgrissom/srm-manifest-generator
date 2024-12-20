import Manifest from '../../type/manifest/Manifest.js';

// MARK: Interface: ConfigData

// TODO jsdoc
interface ConfigData {
	search: {
		manifests: Array<Manifest>;
		scanDirectories: boolean;
		scanRecursively: boolean;
	};
	output: {
		minify: boolean;
		indentSpaces: number;
		mode: OutputMode;
	};
	validate: {
		filePaths: boolean;
		executables: boolean;
		unknownConfigKeys: boolean;
		executableExtensions: Array<string>;
	};
	other: {
		useColor: boolean;
		debug: boolean;
		verbose: boolean;
	};
	logs: {
		enabled: boolean;
		outputPath: string;
		nameFormat: string;
	};
}

// MARK: Enum: OutputMode

enum OutputMode {
	Combine,
	Spread,
}

export { ConfigData, OutputMode };
