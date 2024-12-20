import { ConfigData, OutputMode } from '../../../src/config/type/ConfigData';

const config: ConfigData = {
	search: {
		manifests: [],
		scanDirectories: false,
		scanRecursively: false,
	},
	output: {
		minify: false,
		indentSpaces: 0,
		mode: OutputMode.Combine,
	},
	validate: {
		filePaths: false,
		executables: false,
		unknownConfigKeys: false,
		executableExtensions: [],
	},
	other: {
		useColor: false,
		debug: false,
		verbose: false,
	},
	logs: {
		enabled: false,
		outputPath: '',
		nameFormat: '',
	},
};

export default config;
