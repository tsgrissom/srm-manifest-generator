import Manifest from '../manifest/Manifest.js';
import OutputMode from './OutputMode.js';

// TODO jsdoc for everything

interface ConfigData {
	search: {
		manifests: Manifest[];
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
		executableExtensions: string[];
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

export default ConfigData;
