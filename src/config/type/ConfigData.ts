import { Manifest } from '../../app/type/Manifest.js';

// MARK: Interface: ConfigData

// TODO jsdocs

interface ConfigSearchSection {
	manifests: Array<Manifest>;
	withinDirectories: boolean;
	recursively: boolean;
}

interface ConfigValidateSection {
	configKeys: boolean;
	filePaths: boolean;
	executables: {
		enabled: boolean;
		acceptedExtensions: Array<string>;
	};
}

interface ConfigTransformSection {
	minify: boolean;
	indentationSpaces: number;
	mode: OutputMode;
}

interface ConfigLogSection {
	console: {
		useColor: boolean;
		debug: boolean;
		verbose: boolean;
	};
	file: {
		enabled: boolean;
		outputPath: string;
		nameFormat: string;
	};
}

interface ConfigData {
	search: ConfigSearchSection;
	validate: ConfigValidateSection;
	transform: ConfigTransformSection;
	log: ConfigLogSection;
}

// MARK: Enum: OutputMode

enum OutputMode {
	Combine,
	Spread,
}

export {
	ConfigData,
	ConfigLogSection,
	ConfigSearchSection,
	ConfigTransformSection,
	ConfigValidateSection,
	OutputMode,
};
