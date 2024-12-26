import { ConfigData, OutputMode } from '../../../src/config/type/ConfigData';

const data: ConfigData = {
	search: {
		manifests: [],
		withinDirectories: false,
		recursively: false,
	},
	transform: {
		minify: false,
		indentationSpaces: 0,
		mode: OutputMode.Combine,
	},
	validate: {
		configKeys: false,
		filePaths: false,
		executables: {
			enabled: true,
			acceptedExtensions: ['.exe'],
		},
	},
	log: {
		console: {
			useColor: false,
			debug: false,
			verbose: false,
		},
		file: {
			enabled: false,
			outputPath: '',
			nameFormat: '',
		},
	},
};

export default data;
