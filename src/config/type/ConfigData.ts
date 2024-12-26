import { Manifest } from '../../app/type/Manifest.js';

// MARK: Interface: ConfigData

// TODO jsdocs

export interface ConfigData {
	search: ConfigDataSectionSearch;
	validate: ConfigDataSectionValidate;
	transform: ConfigDataSectionTransform;
	log: ConfigDataSectionLog;
}

// MARK: Section: Search
export interface ConfigDataSectionSearch {
	manifests: Array<Manifest>;
	withinDirectories: boolean;
	recursively: boolean;
}

// MARK: Section: Validate
export interface ConfigDataSectionValidate {
	configKeys: boolean;
	filePaths: boolean;
	executables: ConfigDataSectionValidateSubsectionExecutables;
}

export interface ConfigDataSectionValidateSubsectionExecutables {
	enabled: boolean;
	acceptedExtensions: Array<string>;
}

// MARK: Section: Transform
export interface ConfigDataSectionTransform {
	minify: boolean;
	indentationSpaces: number;
	outputMode: OutputMode;
}

export enum OutputMode {
	Combine = 'Combine',
	Spread = 'Spread',
}

// MARK: Section: Log
export interface ConfigDataSectionLog {
	console: ConfigDataSectionLogSubsectionConsole;
	file: ConfigDataSectionLogSubsectionFile
}

export interface ConfigDataSectionLogSubsectionConsole {
	withColor: boolean;
	debug: boolean;
	verbose: boolean;
}

export interface ConfigDataSectionLogSubsectionFile {
	enabled: boolean;
	outputPath: string;
	nameFormat: string;
}