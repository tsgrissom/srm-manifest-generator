import clr from 'chalk';
import fs from 'node:fs/promises';
import YAML from 'yaml';

import { checkCross, yesNo } from '../../utility/boolean.js';
import {
	clogConfigKeyUnknown,
	clogConfigValueWrongType,
	clogConfigWarn,
	resolveKeyFromAlias,
	vlogConfigValueLoaded,
} from '../../utility/config.js';
import { clog } from '../../utility/console.js';
import { dlog, dlogHeader, isDebugActive, isVerbose, vlog } from '../../utility/debug.js';
import { basenameWithoutExtensions, fmtPath, fmtPathAsTag } from '../../utility/path.js';
import {
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_WARN,
	UNICODE_ARRW_RIGHT,
} from '../../utility/symbols.js';

import ConfigData from '../../type/config/ConfigData.js';
import ConfigKeyAliases from '../../type/config/ConfigKeyAliases.js';
import Manifest from '../../type/manifest/Manifest.js';
import ManifestData from '../../type/manifest/ManifestData.js';

import UserConfig from '../../type/config/UserConfig.js';
import Shortcut from '../../type/shortcut/Shortcut.js';
import { isShortcutData, ShortcutData } from '../../type/shortcut/ShortcutData.js';
import { USER_CONFIG_FILENAME } from '../load-data.js';
import loadManifestShortcuts from './shortcuts.js';

async function makeManifests(
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
		dlog(`${UNICODE_ARRW_RIGHT} Starting: Manifest #${id} ${pathTag}`);

		const exists = await validateManifestPathExists(manPath);
		const okFsType = await validateManifestPathIsSupportedFilesystemType(
			manPath,
			config,
		);

		dlog(`  ${checkCross(exists)} Path exists`);
		dlog(`  ${checkCross(okFsType)} Path is a supported filesystem type`);

		if (!exists) {
			clog(` ${SB_WARN} Skipping non-existent manifest ${pathTag}`);
			continue;
		}

		const object = await readManifestFile(manPath);
		const data = parseManifestFileContentsToData(manPath, object, config);
		const instance = new Manifest(manPath, data);

		okManifests.push(instance);

		dlog(`${SB_OK_LG} Finished: Manifest #${id} ${pathTag}`);
	}

	clogLoadedManifests(manPaths, okManifests);

	return okManifests;
}

function clogLoadedManifests(
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

function parseManifestFileContentsToData(
	filePath: string,
	obj: object,
	config: UserConfig,
): ManifestData {
	const keyAliases: ConfigKeyAliases = {
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

	dlog(`${UNICODE_ARRW_RIGHT} Loading: Manifest ${fmtPathAsTag(filePath)}`);

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
				const manName = data.sourceName; // TODO Replace with an id

				// TODO Move all this to its own function, maybe its own file `shortcut-data.ts` or to `shortcut.ts`?

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

				// if (
				// 	Array.isArray(value) &&
				// 	!value.every(element => element instanceof Shortcut)
				// ) {
				// 	console.log(
				// 		clr.red(`SHORTCUTS!!! ONE ELEMENT NOT A SHORTCUT: ${manName}`),
				// 	);

				// 	for (const element of value) {
				// 		console.log(element as object);
				// 	}

				// 	break;
				// }

				// if (
				// 	typeof value === 'object' &&
				// 	Array.isArray(value) //&&
				// 	// value.every(element => element instanceof Shortcut)
				// ) {
				// 	hasShortcuts = true;
				// 	data.shortcuts = value;
				// 	dlogConfigValueLoaded(resolved, value);
				// 	break;
				// }

				const totalLen = value.length;

				const okShortcuts: Array<ShortcutData> = [];
				const disabledShortcuts: Array<ShortcutData> = [];
				let failLen = 0;

				for (const element of value) {
					if (!isShortcutData(element)) {
						clog(
							`  ${SB_ERR_SM} Invalid shortcut data found (Manifest: ${manName}):`,
						);
						if (isDebugActive()) {
							console.log(element);
						}
						failLen++;

						continue;
					}

					const isEnabled = new Shortcut(element).isEnabled;

					vlog(`  ${SB_OK_SM} Valid shortcut data for title ${element.title}`);
					if (isVerbose()) {
						clog(`    > From Manifest: ${manName}`);
						clog(`    > Title: ${element.title}`);
						clog(`    > Target: ${element.target}`);
						clog(`    > Enabled? ${yesNo(isEnabled)}`);
					}

					if (!isEnabled) {
						disabledShortcuts.push(element);
						continue;
					}

					okShortcuts.push(element);
				}

				const okLen = okShortcuts.length;
				const disabledLen = disabledShortcuts.length;
				const diffTotalToDisabled = totalLen - disabledLen;
				const enabledLen = diffTotalToDisabled <= 0 ? 0 : diffTotalToDisabled;

				if (enabledLen <= 0 && totalLen > 0) {
					dlog(
						`${SB_OK_LG} All shortcuts were disabled in manifest ${manName} (${disabledLen} disabled)`,
					);
					break;
				}

				if (okLen === totalLen) {
					// equal ok to total
					if (totalLen <= 0) {
						// none to load, so none are ok; pass
						dlog(
							`${SB_OK_LG} Loaded no shortcuts because there were none to load (Manifest: ${manName})`,
						);
					} else {
						// all were loaded; pass
						dlog(
							`${SB_OK_LG} All shortcuts from manifest ${manName} loaded successfully (${okLen})`,
						);
					}
				} else {
					// inequal ok to total
					if (okLen <= 0) {
						// there were some to load, but none were ok; fail
						dlog(
							`${SB_ERR_LG} All shortcuts from manifest ${manName} failed to load (${totalLen} failed)`,
						);
					} else {
						// some of the total were loaded, some failed
						clog(
							`${SB_WARN} Some shortcuts from manifest ${manName} failed to load (${okLen} ok, ${failLen} failed)`,
						);

						if (failLen > 0) {
							// at least one failed
							clog(
								`  ${SB_ERR_SM} Some shortcuts from manifest ${manName} failed to load (${failLen} failed)`,
								`  - To view the failed shortcut, re-execute with the ${clr.italic('--debug')} flag`,
							);
						}

						if (disabledLen > 0) {
							// at least one
							dlog(
								`  ${SB_OK_SM} Some shortcuts from manifest ${manName} were disabled (${disabledLen} disabled)`,
							);
						}
					}
				}

				hasShortcuts = true;
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

export default makeManifests;
