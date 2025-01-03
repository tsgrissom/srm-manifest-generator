import { Manifest } from '../../app/type/Manifest.js';
import {
	isDebugActive,
	isEnvVerbose,
	isProcessVerbose,
} from '../../util/logging/debug.js';
import {
	OutputMode,
} from './ConfigData.js';
import DefaultConfig from './DefaultConfig.js';

// TODO Location should be customizable with env var
// TODO Track load messages like Value of key must be x but was y issues so they can be printed on demand instead of automatically every time
// TODO Re-write interface to support current type definition as well as metadata about the key/value and its role (name, desc, default)
// TODO Write typeguards
// TODO Load manifest paths, not the whole Manifest object, at startup aka separate the processes; This is currently being done in config/parseSection/search.ts
// TODO jsdocs
class UserConfig extends DefaultConfig {

	// TODO constructor arg which sets options based on a given ConfigData? then falls back on the defaults?
	// TODO jsdocs below

	// Section: Search
	public get manifests(): Array<Manifest> {
		return this.search.manifests;
	}

	public get manifestPaths(): Array<string> {
		return this.search.manifests.map(manifest => manifest.filePath);
	}

	public get shouldSearchWithinDirectories(): boolean {
		return this.search.withinDirectories ?? true;
	}

	public get shouldSearchRecursively(): boolean {
		return this.search.recursively ?? false;
	}

	// Section: Validate

	public get shouldValidateFilePaths(): boolean {
		return this.validate.filePaths ?? true;
	}

	public get shouldValidateExecutables(): boolean {
		return this.validate.executables.enabled ?? true;
	}

	public get shouldWarnUnknownConfigKey(): boolean {
		return this.validate.configKeys ?? true;
	}

	public get getListOfAcceptableExecutableFileExtensions(): Array<string> {
		return this.validate.executables.acceptedExtensions ?? ['.exe'];
	}

	// Section: Transform

	public get shouldMinifyOutput(): boolean {
		return this.transform.minify ?? true;
	}

	public get getIndentationSpaces(): number {
		return this.transform.indentationSpaces ?? 2;
	}

	public get getOutputMode(): OutputMode {
		return this.transform.outputMode;
	}

	// Section: Log

	public get shouldConsoleUseColor(): boolean {
		return this.log.console.withColor ?? true;
	}

	public get isDebugging(): boolean {
		return (this.log.console.debug ?? false) || isDebugActive(true);
	}

	public get isVerbose(): boolean {
		return (
			(this.log.console.verbose ?? false) || isEnvVerbose() || isProcessVerbose()
		);
	}

	public get isFileLoggingEnabled(): boolean {
		return this.log.file.enabled ?? true;
	}

	public get logFileOutputPath(): string {
		return this.log.file.outputPath ?? './';
	}

	public get logFileNameFormat(): string {
		return this.log.file.nameFormat ?? 'srmg_YYYY-MM-DD_HH-MM-SS.log';
	}
}

export { UserConfig };
