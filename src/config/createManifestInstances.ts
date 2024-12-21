import clr from 'chalk';
import fs from 'node:fs/promises';
import YAML from 'yaml';

import { checkCross, yesNo } from '../util/boolean.js';
import {
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	clogConfigWarn,
	vlogConfigValueLoaded,
} from '../util/logging/config.js';
import { clog } from '../util/logging/console.js';

import { Manifest } from '../app/type/Manifest.js';
import { ManifestData } from '../app/type/ManifestData.js';
import Shortcut from '../app/type/Shortcut.js';
import { isShortcutData, ShortcutData } from '../app/type/ShortcutData.js';
import { basenameWithoutExtensions, fmtPath, fmtPathAsTag } from '../util/file/path.js';
import { resolveKeyFromAlias, YamlKeyAliases } from '../util/file/yaml.js';
import {
	dlog,
	dlogHeader,
	isDebugActive,
	vlog,
	vlogList,
} from '../util/logging/debug.js';
import {
	SB_BULLET,
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_SECT_END_OK,
	SB_SECT_START,
	SB_WARN,
} from '../util/string/symbols.js';
import { quote } from '../util/string/wrap.js';
import loadManifestShortcuts from './createShortcutInstance.js';
import { USER_CONFIG_FILENAME } from './loadFileData.js';
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
		const pathTag = fmtPathAsTag(manPath);
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
	const pathTag = fmtPath(filePath);

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
	const pathTag = fmtPathAsTag(filePath);

	try {
		const stats = await fs.stat(filePath);

		if (!stats.isFile() && !stats.isDirectory())
			clogConfigWarn(
				`Unsupported filesystem type (Supported: File or Folder) was set as a manifest path in the user ${USER_CONFIG_FILENAME}.`,
			);

		const { scanDirectories, scanRecursively } = config.search;

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
	const pathTag = fmtPathAsTag(manPath);

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

// MARK: ShortcutsDataParseResult

interface ShortcutsDataParseResult {
	readonly totalCount: number;
	readonly failCount: number;
	readonly okShortcuts: Array<ShortcutData>;
	readonly disabledShortcuts: Array<ShortcutData>;
}

// MARK: parseShortcutsToShortcutDataArray

// TODO Move all this to its own namespace, maybe its own file `shortcut-data.ts` or to `shortcut.ts`?
function parseShortcutsToShortcutDataArray(
	value: Array<unknown>,
	parent?: ManifestData,
): ShortcutsDataParseResult {
	const manName = parent?.sourceName ?? 'Unknown';
	const totalLen = value.length;
	const okShortcuts: Array<ShortcutData> = [];
	const disabledShortcuts: Array<ShortcutData> = [];
	let failCount = 0;

	for (const element of value) {
		if (!isShortcutData(element)) {
			clog(`  ${SB_ERR_SM} Invalid shortcut data found (Manifest: ${manName}):`);
			if (isDebugActive()) {
				console.log(element);
			}
			failCount++;

			continue;
		}

		const isEnabled = new Shortcut(element).isEnabled;
		const fmtTitle = quote(element.title);
		const fmtTarget = fmtPath(element.target);
		const fmtEnabled = yesNo(isEnabled);

		vlog(`  ${SB_OK_SM} Valid shortcut data for title ${fmtTitle}`);
		vlogList(
			`     ${SB_BULLET} `,
			`From Manifest: ${manName}`,
			`Title: ${fmtTitle}`,
			`Target: ${fmtTarget}`,
			`Enabled? ${fmtEnabled}`,
		);

		if (!isEnabled) {
			disabledShortcuts.push(element);
			continue;
		}

		okShortcuts.push(element);
	}

	return {
		totalCount: totalLen,
		failCount: failCount,
		okShortcuts: okShortcuts,
		disabledShortcuts: disabledShortcuts,
	};
}

// MARK: validateShortcutsParseResultSuccess

/**
 * Reads the results of a {@link ShortcutsDataParseResult},
 * logging important info to the appropriate levels,
 * and returning a `boolean` which indicates whether
 * the result was a pass or a fail (`true` or `false`.)
 *
 * @param result The result to validate.
 * @param parent Provides a parent manifest name
 *  for log messages.
 * @returns Whether the given result passed or failed.
 *  `true` is pass, `false` is fail.
 */
// TODO Move all this to its own namespace, maybe its own file `shortcut-data.ts` or to `shortcut.ts`?
function validateShortcutsParseResultSuccess(
	result: ShortcutsDataParseResult,
	parent?: ManifestData,
): boolean {
	const manName = parent?.sourceName ?? 'Unknown';
	const totalCount = result.totalCount;
	const okCount = result.okShortcuts.length;
	const failCount = result.failCount;
	const disabledCount = result.disabledShortcuts.length;

	// there is nothing to load; pass
	if (totalCount <= 0) {
		// none to load, so none are ok; pass
		dlog(
			`${SB_OK_LG} Loaded no shortcuts because there were none to load (Manifest: ${manName})`,
		);
		return true;
	}

	// there is something to load, catch special cases
	if (totalCount > 0) {
		// all are disabled
		if (disabledCount === totalCount) {
			// there are some, but they are all disabled; pass
			dlog(
				`${SB_WARN} All shortcuts from manifest ${manName} are disabled (${disabledCount} disabled)`,
			);
			return true;
		}

		if (failCount === totalCount) {
			// all failed to load; fail
			dlog(
				`${SB_ERR_LG} All shortcuts from manifest ${manName} failed to load (${failCount} failed)`,
			);
			return false;
		}

		if (okCount === totalCount) {
			// all were loaded; pass
			dlog(
				`${SB_OK_LG} All shortcuts from manifest ${manName} loaded successfully (${okCount} loaded)`,
			);
			return true;
		}
	}

	// there is something to load
	// the following wont reach: all disabled, all failed, all ok

	// some were loaded, some failed
	clog(
		`${SB_WARN} Some shortcuts from manifest ${manName} failed to load (${okCount} ok, ${failCount} failed)`,
	);

	// if at least one was disabled
	if (disabledCount > 0) {
		dlog(
			`  ${SB_OK_SM} Some shortcuts from manifest ${manName} were disabled (${disabledCount} disabled)`,
		);
	}

	// if at least one failed
	if (failCount > 0) {
		clog(
			`  ${SB_ERR_SM} Some shortcuts from manifest ${manName} failed to load (${failCount} failed)`,
			`  - To view the failed shortcut, re-execute with the ${clr.italic('--debug')} flag`,
		);
	}

	return true;
}

// MARK: parseManifestFileContentsToData

function parseManifestFileContentsToData(
	filePath: string,
	obj: object,
	config: UserConfig,
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

	dlog(`${SB_SECT_START}Loading: Manifest ${fmtPathAsTag(filePath)}`);

	let hasShortcuts = false;

	for (const [key, value] of Object.entries(document)) {
		const resolved = resolveKeyFromAlias(keyAliases, key, null);
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

				const result = parseShortcutsToShortcutDataArray(value, data);
				const { okShortcuts } = result;
				const wasSuccessful = validateShortcutsParseResultSuccess(result, data);

				hasShortcuts = wasSuccessful;
				data.shortcuts = okShortcuts.map(each => new Shortcut(each), config);
				vlogConfigValueLoaded(resolved, value);
				break;
			}
			default: {
				clogConfigKeyUnknown(fullGivenKey, config);
			}
		}
	}

	const pathTag = fmtPathAsTag(filePath);
	const hasSourceName = data.sourceName.trim() !== '';
	const hasBaseDirectory = data.baseDirectory.trim() !== '';
	const hasOutputPath = data.outputPath.trim() !== '';

	vlog(
		`  ${checkCross(hasBaseDirectory)} Has required attribute "baseDirectory"?`,
		`  ${checkCross(hasOutputPath)} Has required attribute "outputPath"?`,
		`  ${checkCross(hasSourceName)} Has optional attribute "sourceName"?`,
		`  ${checkCross(hasShortcuts)} Has optional attribute "shortcuts"?`,
	);

	// Fallback om filename
	if (!hasSourceName)
		data.sourceName = basenameWithoutExtensions(
			filePath,
			['.yml', '.yaml', '.manifest'],
			true,
		);
	// Make sure required attributes are present
	// TODO Soft fail these
	if (!hasBaseDirectory)
		throw new Error(`Manifest is missing a root directory attribute ${pathTag}`);
	if (!hasOutputPath)
		throw new Error(`Manifest is missing an output directory attribute ${pathTag}`);

	if (hasShortcuts) {
		const value = data.shortcuts;
		data.shortcuts = loadManifestShortcuts(data, value, config);
	}

	return data;
}

export default createManifestInstances;
