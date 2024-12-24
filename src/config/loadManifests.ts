import fs from 'node:fs/promises';
import YAML from 'yaml';

import {
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	clogConfigWarn,
	vlogConfigValueLoaded,
} from '../util/logging/config.js';
import { clog } from '../util/logging/console.js';
import { checkCross } from '../util/string/format.js';

import clr from 'chalk';
import { Manifest } from '../app/type/Manifest.js';
import { ManifestData } from '../app/type/ManifestData.js';
import Shortcut from '../app/type/Shortcut.js';
import { basenameWithoutExtensions } from '../util/file/path.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../util/file/yaml.js';
import { dlog, dlogHeader, vlog } from '../util/logging/debug.js';
import * as fmt from '../util/string/format.js';
import {
	SB_ERR_LG,
	SB_OK_LG,
	SB_SECT_END_OK,
	SB_SECT_START,
	SB_WARN,
} from '../util/string/symbols.js';
import {
	createShortcutsFromData,
	parseObjectsIntoArrayOfShortcutData,
	validateParseShortcutObjectsIntoDataSuccessful,
} from './loadShortcuts.js';
import { USER_CONFIG_FILENAME } from './readFile.js';
import { ConfigData } from './type/ConfigData.js';
import { UserConfig } from './type/UserConfig.js';

// MARK: createManifestInstances
async function createManifestInstances(
	manPaths: Array<string>,
	config: UserConfig,
): Promise<Array<Manifest>> {
	dlogHeader('CREATING MANIFEST OBJECTS FROM FILES');

	const okManifests: Array<Manifest> = [];

	if (manPaths.length === 0) {
		clog(
			`${SB_WARN} User ${USER_CONFIG_FILENAME} manifest paths was empty. No manifests will be loaded or processed.`,
		);
		return okManifests;
	}

	for (const [index, manPath] of manPaths.entries()) {
		const id = index + 1;
		const pathTag = fmt.pathAsTag(manPath);
		dlog(`${SB_SECT_START}Starting: Manifest #${id} ${pathTag}`);

		const exists = await validateManifestPathExists(manPath);
		const okFsType = await validateManifestPathIsSupportedFilesystemType(
			manPath,
			config,
		);

		vlog(`  ${checkCross(exists)} Path exists`);
		vlog(`  ${checkCross(okFsType)} Path is a supported filesystem type`);

		if (!exists) {
			clog(` ${SB_WARN} Skipping non-existent manifest ${pathTag}`);
			continue;
		}

		const object = await readManifestFile(manPath);
		const data = parseManifestFileContentsToData(manPath, object, config);
		const instance = new Manifest(manPath, data, config);

		okManifests.push(instance);

		dlog(`${SB_SECT_END_OK}Finished: Manifest #${id} ${pathTag}`);
	}

	logLoadedManifests(manPaths, okManifests);

	return okManifests;
}

// MARK: clogLoadedManifests
function logLoadedManifests(
	manifestPaths: Array<string>,
	okManifests: Array<Manifest>,
): void {
	const nAll = manifestPaths.length;
	const nOk = okManifests.length;
	const nFail = nAll - nOk;

	if (nOk <= 0) {
		// none were ok
		if (nOk === nAll) {
			// none to load so none were ok; pass + warn
			clog(`${SB_WARN} Since no manifest paths were configured, none were loaded`);
		} else {
			// all failed to load; err
			clog(
				`${SB_ERR_LG} All configured manifest paths failed to load (${nAll} failed)`,
			);
		}
	} else {
		// at least one ok
		if (nOk === nAll) {
			// at loaded ok; pass
			dlog(
				`${SB_OK_LG} All configured manifest paths were loaded succesfully (${nAll})`,
			);
		} else {
			// at least one failed to load; err
			clog(
				`${SB_ERR_LG} At least one configured manifest path failed to load (${nFail} failed)`,
			);
		}
	}
}

// MARK: validateManifestPathExists
async function validateManifestPathExists(filePath: string): Promise<boolean> {
	const pathTag = fmt.path(filePath);

	try {
		await fs.access(filePath).catch(() => {
			return false;
		});
	} catch {
		throw new Error(`Error while validating manifest path existence ${pathTag}`);
	}

	return true;
}

// MARK: validateManifestPathIsSupportedFilesystemType
async function validateManifestPathIsSupportedFilesystemType(
	filePath: string,
	config: ConfigData,
): Promise<boolean> {
	const pathTag = fmt.pathAsTag(filePath);

	try {
		const stats = await fs.stat(filePath);

		if (!stats.isFile() && !stats.isDirectory())
			clogConfigWarn(
				`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`,
			);

		const { scanDirectories } = config.search;

		if (stats.isFile()) {
			return true;
		} else if (stats.isDirectory()) {
			if (!scanDirectories) {
				clogConfigWarn(
					`Manifests file path list contains a path pointing to a directory, but scanning directories is disabled by the user's ${USER_CONFIG_FILENAME}. The following path will be skipped: ${filePath}`,
				);
				return false;
			}

			return true;
		} else {
			clogConfigWarn(
				`Unsupported filesystem type at the given path was ignored ${pathTag}`,
			);
		}
	} catch {
		throw new Error(`Failed to stat manifest path ${filePath}`);
	}

	return true;
}

// MARK: readManifestFile
async function readManifestFile(manPath: string): Promise<object> {
	const pathTag = fmt.pathAsTag(manPath);

	if (!manPath) {
		throw new Error(`Arg filePath was invalid: ${manPath}`);
	}
	if (manPath.trim() === '') {
		throw new Error(`Arg filePath cannot be empty: ${manPath}`);
	}

	try {
		const contents = await fs.readFile(manPath, 'utf-8');
		const object = YAML.parse(contents) as ManifestData;
		return object;
	} catch {
		throw new Error(`Unable to read manifest file at manpath ${pathTag}`);
	}
}

interface LoadManifestShortcutsResult {
	hasShortcuts: boolean;
	loadedShortcuts: Array<Shortcut>;
	invalidShortcuts: Array<object>;
	count: {
		nonObjects: number;
	};
}

// MARK: loadShortcuts
function loadShortcuts(
	arr: Array<unknown>,
	sourceName = 'Unknown',
	config?: UserConfig,
): LoadManifestShortcutsResult {
	dlog('');
	dlog(clr.cyanBright.underline(`LOADING SHORTCUTS FROM MANIFEST ${sourceName}`));

	const result: LoadManifestShortcutsResult = {
		hasShortcuts: false,
		loadedShortcuts: [],
		invalidShortcuts: [],
		count: {
			nonObjects: 0,
		},
	};

	if (arr.length === 0) {
		dlog(`  ${SB_WARN} There were no shortcuts to load from manifest ${sourceName}`);
		return result;
	}

	const resultOfParse = parseObjectsIntoArrayOfShortcutData(arr);
	result.hasShortcuts = validateParseShortcutObjectsIntoDataSuccessful(
		resultOfParse,
		sourceName,
	);

	const { validShortcuts } = resultOfParse;
	const nAll = validShortcuts.length;

	vlog(`  ${nAll} total shortcuts in this manifest`);

	const okShortcuts: Array<Shortcut> = createShortcutsFromData(validShortcuts, config);

	result.loadedShortcuts = okShortcuts;
	result.invalidShortcuts = resultOfParse.invalidShortcuts;
	result.count.nonObjects = resultOfParse.count.nonObjects;

	return result;
}

// MARK: parseManifestFileContentsToData
function parseManifestFileContentsToData(
	filePath: string,
	obj: object,
	config?: UserConfig,
): ManifestData {
	const keyAliases: YamlKeyAliases = {
		sourceName: 'sourceName',
		name: 'sourceName',

		baseDirectory: 'baseDirectory',
		baseDir: 'baseDirectory',
		directory: 'baseDirectory',
		root: 'baseDirectory',
		rootDir: 'baseDirectory',
		rootDirectory: 'baseDirectory',

		output: 'outputPath',
		outputPath: 'outputPath',
		outputFile: 'outputPath',
		out: 'outputPath',
		outputDirectory: 'outputPath',
		outputDir: 'outputPath',

		shortcuts: 'shortcuts',
		entries: 'shortcuts',
		titles: 'shortcuts',
	};
	const data: ManifestData = {
		sourceName: '',
		baseDirectory: '',
		outputPath: '',
		shortcuts: [],
	};

	if (!Object.keys(obj)) {
		// TODO more graceful exit
		throw new Error('Manifest has no top level keys');
	}

	const document = obj as Record<string, unknown>;

	if (typeof document !== 'object' || Array.isArray(document) || document === null) {
		throw new Error(`Manifest is not an object (Type: ${typeof document})`);
	}

	dlog(`${SB_SECT_START}Loading: Manifest ${fmt.pathAsTag(filePath)}`);

	let hasShortcuts = false;

	for (const [key, value] of Object.entries(document)) {
		const resolved = resolveKeyFromAlias(keyAliases, key);
		const { fullGivenKey, resolvedKey } = resolved;

		switch (resolvedKey) {
			case 'sourceName': {
				if (typeof value !== 'string') {
					// Not a failure for Manifest
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.sourceName = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'baseDirectory': {
				if (typeof value !== 'string') {
					// Manifest fails
					// TODO Soft fail this manifest only
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.baseDirectory = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'outputPath': {
				if (typeof value !== 'string') {
					// Manifest fails
					// TODO Soft fail this manifest only
					clogConfigValueWrongType(fullGivenKey, 'string', value);
					break;
				}

				// TODO Check for empty

				data.outputPath = value;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			case 'shortcuts': {
				if (!Array.isArray(value)) {
					clogConfigValueWrongType(
						fullGivenKey,
						'array of shortcut objects',
						value,
					);
					// TODO Break down what's wrong for debug log
					// TODO Verbose log something like this:
					// Is value type === object? Yes/No
					// Is value an array? Yes/No
					//
					// Is value an array of objects? Yes/No
					//   Is array? Yes/No (type if no)
					//   Is every element an object? Yes/No
					break;
				}

				const resultOfLoadShortcuts = loadShortcuts(
					value,
					data.sourceName,
					config,
				);

				hasShortcuts = resultOfLoadShortcuts.hasShortcuts;
				data.shortcuts = resultOfLoadShortcuts.loadedShortcuts;
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	const pathTag = fmt.pathAsTag(filePath);
	const hasSourceName = data.sourceName.trim() !== '';
	const hasBaseDirectory = data.baseDirectory.trim() !== '';
	const hasOutputPath = data.outputPath.trim() !== '';

	vlog(
		`  ${checkCross(hasBaseDirectory)} Has required attribute "baseDirectory"?`,
		`  ${checkCross(hasOutputPath)} Has required attribute "outputPath"?`,
		`  ${checkCross(hasSourceName)} Has optional attribute "sourceName"?`,
		`  ${checkCross(hasShortcuts)} Has optional attribute "shortcuts"?`,
	);

	// Fallback on filename
	// TODO This doesn't need to be here, or it should be elsewhere
	if (!hasSourceName) data.sourceName = basenameWithoutExtensions(filePath);
	// Make sure required attributes are present
	// TODO Soft fail these
	if (!hasBaseDirectory)
		throw new Error(`Manifest is missing a root directory attribute ${pathTag}`);
	if (!hasOutputPath)
		throw new Error(`Manifest is missing an output directory attribute ${pathTag}`);

	return data;
}

export default createManifestInstances;
