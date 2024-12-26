import { Manifest } from '../../app/type/Manifest.js';

// MARK: Interface: ConfigData

// TODO jsdocs

interface ConfigData {
	search: ConfigSectionSearch;
	validate: ConfigSectionValidate;
	transform: ConfigSectionTransform;
	log: ConfigSectionLog;
}

// MARK: Section: Search
interface ConfigSectionSearch {
	manifests: Array<Manifest>;
	withinDirectories: boolean;
	recursively: boolean;
}

// MARK: Section: Validate
interface ConfigSectionValidate {
	configKeys: boolean;
	filePaths: boolean;
	executables: ConfigSectionValidateSubsectionExecutables;
}

interface ConfigSectionValidateSubsectionExecutables {
	enabled: boolean;
	acceptedExtensions: Array<string>;
}

// MARK: Section: Transform
interface ConfigSectionTransform {
	minify: boolean;
	indentationSpaces: number;
	mode: OutputMode;
}

enum OutputMode {
	Combine,
	Spread,
}

// MARK: Section: Log
interface ConfigSectionLog {
	console: ConfigSectionLogSubsectionConsole;
	file: ConfigSectionLogSubsectionFile
}

interface ConfigSectionLogSubsectionConsole {
	withColor: boolean;
	debug: boolean;
	verbose: boolean;
}

interface ConfigSectionLogSubsectionFile {
	enabled: boolean;
	outputPath: string;
	nameFormat: string;
}

export {
	ConfigData,
	ConfigSectionLog,
	ConfigSectionSearch,
	ConfigSectionTransform,
	ConfigSectionValidate,
	OutputMode,
};
